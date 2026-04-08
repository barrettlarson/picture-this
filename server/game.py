import asyncio
import json
import time
import uuid

from player import Player
from words import get_word_choices


def levenshtein(a, b):
    n, m = len(a), len(b)
    if n > m:
        a, b = b, a
        n, m = m, n
    row = list(range(n + 1))
    for i in range(1, m + 1):
        prev = row[:]
        row[0] = i
        for j in range(1, n + 1):
            cost = 0 if b[i - 1] == a[j - 1] else 1
            row[j] = min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost)
    return row[n]


class Game:
    TOTAL_ROUNDS = 3
    TURN_DURATION = 80
    WORD_PICK_DURATION = 15
    TURN_END_PAUSE = 5
    HINT_1_FRACTION = 0.5
    HINT_2_FRACTION = 0.25

    def __init__(self):
        self.players: dict[str, Player] = {}
        self.phase = "lobby"  # lobby | picking | drawing | turn_end | game_end
        self.round = 0
        self.current_drawer_id: str | None = None
        self.current_word: str | None = None
        self.word_choices: list[str] = []
        self.turn_order: list[str] = []
        self.turn_index = 0
        self.timer_task: asyncio.Task | None = None
        self.time_left = 0
        self.turn_start_time = 0
        self.hints_revealed: set[int] = set()
        self.stroke_history: list[dict] = []

    # --- Player Management ---

    async def add_player(self, websocket, username: str) -> Player | str:
        for p in self.players.values():
            if p.username.lower() == username.lower():
                return "Username already taken"

        player_id = str(uuid.uuid4())[:8]
        player = Player(id=player_id, username=username, websocket=websocket)
        self.players[player_id] = player

        await self.send(player, {
            "type": "joined",
            "playerId": player_id,
            "username": username,
        })

        await self.broadcast_player_list()
        await self.broadcast_system_message(f"{username} joined the game!")

        if self.phase == "lobby" and len(self.players) >= 2:
            await self.start_game()

        return player

    async def remove_player(self, player_id: str):
        player = self.players.pop(player_id, None)
        if not player:
            return

        await self.broadcast_system_message(f"{player.username} left the game!")
        await self.broadcast_player_list()

        if self.phase != "lobby" and len(self.players) < 2:
            self.cancel_timer()
            self.phase = "lobby"
            self.round = 0
            self.current_word = None
            self.current_drawer_id = None
            self.stroke_history = []
            for p in self.players.values():
                p.score = 0
                p.has_guessed = False
                p.is_drawing = False
            await self.broadcast_game_state()
            await self.broadcast_system_message("Not enough players. Returning to lobby.")
            return

        if self.phase in ("picking", "drawing") and player_id == self.current_drawer_id:
            self.cancel_timer()
            await self.broadcast_system_message(f"The drawer left! The word was: {self.current_word or '???'}")
            await self.end_turn()

    def get_player_by_ws(self, websocket) -> Player | None:
        for p in self.players.values():
            if p.websocket == websocket:
                return p
        return None

    # --- Game Flow ---

    async def start_game(self):
        self.round = 1
        for p in self.players.values():
            p.score = 0
        self.turn_order = list(self.players.keys())
        self.turn_index = 0
        await self.broadcast_system_message(f"Game starting! Round {self.round}/{self.TOTAL_ROUNDS}")
        await self.start_turn()

    async def start_turn(self):
        if self.turn_index >= len(self.turn_order):
            self.round += 1
            if self.round > self.TOTAL_ROUNDS:
                await self.end_game()
                return
            alive = [pid for pid in self.turn_order if pid in self.players]
            if len(alive) < 2:
                await self.end_game()
                return
            self.turn_order = alive
            self.turn_index = 0
            await self.broadcast_system_message(f"Round {self.round}/{self.TOTAL_ROUNDS}")

        while self.turn_index < len(self.turn_order):
            drawer_id = self.turn_order[self.turn_index]
            if drawer_id in self.players:
                break
            self.turn_index += 1
        else:
            self.round += 1
            if self.round > self.TOTAL_ROUNDS:
                await self.end_game()
                return
            alive = [pid for pid in self.turn_order if pid in self.players]
            self.turn_order = alive
            self.turn_index = 0
            if len(alive) < 2:
                await self.end_game()
                return
            drawer_id = self.turn_order[0]

        self.current_drawer_id = drawer_id
        self.current_word = None
        self.stroke_history = []
        self.hints_revealed = set()

        for p in self.players.values():
            p.has_guessed = False
            p.is_drawing = (p.id == drawer_id)

        self.word_choices = get_word_choices(3)
        self.phase = "picking"
        self.time_left = self.WORD_PICK_DURATION

        drawer = self.players[drawer_id]
        await self.send(drawer, {
            "type": "word_choices",
            "words": self.word_choices,
        })

        await self.broadcast_game_state()
        self.start_timer(self.WORD_PICK_DURATION, self.on_pick_timeout)

    async def on_pick_timeout(self):
        if self.phase == "picking":
            self.current_word = self.word_choices[0]
            await self.begin_drawing_phase()

    async def pick_word(self, player_id: str, word: str):
        if self.phase != "picking" or player_id != self.current_drawer_id:
            return
        if word not in self.word_choices:
            return
        self.cancel_timer()
        self.current_word = word
        await self.begin_drawing_phase()

    async def begin_drawing_phase(self):
        self.phase = "drawing"
        self.time_left = self.TURN_DURATION
        self.turn_start_time = time.time()
        self.hints_revealed = set()

        await self.broadcast_game_state()
        self.start_timer(self.TURN_DURATION, self.on_turn_timeout)

    async def on_turn_timeout(self):
        if self.phase == "drawing":
            await self.broadcast_system_message(f"Time's up! The word was: {self.current_word}")
            await self.end_turn()

    async def end_turn(self):
        self.cancel_timer()
        self.phase = "turn_end"
        self.time_left = self.TURN_END_PAUSE

        await self.broadcast({
            "type": "turn_end",
            "word": self.current_word,
        })
        await self.broadcast_game_state()

        self.turn_index += 1
        await asyncio.sleep(self.TURN_END_PAUSE)

        if self.phase == "turn_end":
            await self.start_turn()

    async def end_game(self):
        self.phase = "game_end"
        self.cancel_timer()

        sorted_players = sorted(
            self.players.values(),
            key=lambda p: p.score,
            reverse=True,
        )
        results = [{"username": p.username, "score": p.score} for p in sorted_players]

        await self.broadcast({
            "type": "game_end",
            "results": results,
        })
        await self.broadcast_game_state()

        await asyncio.sleep(10)
        if self.phase == "game_end":
            self.phase = "lobby"
            self.round = 0
            self.current_word = None
            self.current_drawer_id = None
            self.stroke_history = []
            for p in self.players.values():
                p.score = 0
                p.has_guessed = False
                p.is_drawing = False
            await self.broadcast_game_state()
            if len(self.players) >= 2:
                await self.start_game()

    # --- Guess Handling ---

    async def handle_guess(self, player: Player, text: str):
        if self.phase != "drawing":
            await self.broadcast_chat(player.username, text)
            return

        if player.id == self.current_drawer_id:
            return

        if player.has_guessed:
            await self.broadcast_chat(player.username, text)
            return

        guess = text.strip().lower()
        word = (self.current_word or "").lower()

        if guess == word:
            player.has_guessed = True
            elapsed = time.time() - self.turn_start_time
            guesser_points = max(50, int(500 - elapsed * 5))
            player.score += guesser_points

            drawer = self.players.get(self.current_drawer_id)
            if drawer:
                drawer.score += 100

            await self.broadcast({
                "type": "correct_guess",
                "username": player.username,
                "points": guesser_points,
            })
            await self.broadcast_player_list()

            guessers = [p for p in self.players.values()
                        if p.id != self.current_drawer_id]
            if all(p.has_guessed for p in guessers):
                await self.broadcast_system_message("Everyone guessed the word!")
                await self.end_turn()
            return

        dist = levenshtein(guess, word)
        if dist <= 2 and len(word) > 3:
            await self.send(player, {
                "type": "close_guess",
                "message": f'"{text}" is close!',
            })
        else:
            await self.broadcast_chat(player.username, text)

    # --- Drawing ---

    async def handle_draw(self, player: Player, data: dict):
        if self.phase != "drawing" or player.id != self.current_drawer_id:
            return

        self.stroke_history.append(data)

        for p in self.players.values():
            if p.id != player.id:
                await self.send(p, {"type": "draw", **data})

    async def handle_fill(self, player: Player, data: dict):
        if self.phase != "drawing" or player.id != self.current_drawer_id:
            return

        self.stroke_history.append({"action": "fill", **data})

        for p in self.players.values():
            if p.id != player.id:
                await self.send(p, {"type": "fill", **data})

    async def handle_undo(self, player: Player):
        if self.phase != "drawing" or player.id != self.current_drawer_id:
            return

        self.stroke_history.append({"action": "undo"})

        for p in self.players.values():
            if p.id != player.id:
                await self.send(p, {"type": "undo"})

    async def handle_clear(self, player: Player):
        if self.phase != "drawing" or player.id != self.current_drawer_id:
            return

        self.stroke_history.append({"action": "clear"})

        for p in self.players.values():
            if p.id != player.id:
                await self.send(p, {"type": "clear"})

    # --- Hints ---

    def get_hint(self) -> str:
        if not self.current_word:
            return ""

        word = self.current_word
        elapsed = time.time() - self.turn_start_time
        fraction_remaining = max(0, 1 - elapsed / self.TURN_DURATION)

        reveal_count = 0
        if fraction_remaining <= self.HINT_2_FRACTION:
            reveal_count = max(1, len(word.replace(" ", "")) // 2)
        elif fraction_remaining <= self.HINT_1_FRACTION:
            reveal_count = max(1, len(word.replace(" ", "")) // 4)

        letter_positions = [i for i, c in enumerate(word) if c != " "]

        if not self.hints_revealed and reveal_count > 0:
            import random
            self.hints_revealed = set(random.sample(
                letter_positions,
                min(reveal_count, len(letter_positions)),
            ))

        if reveal_count > len(self.hints_revealed):
            import random
            unrevealed = [i for i in letter_positions if i not in self.hints_revealed]
            needed = reveal_count - len(self.hints_revealed)
            self.hints_revealed.update(random.sample(
                unrevealed,
                min(needed, len(unrevealed)),
            ))

        result = ""
        for i, c in enumerate(word):
            if c == " ":
                result += " "
            elif i in self.hints_revealed:
                result += c
            else:
                result += "_"
        return result

    # --- Timer ---

    def start_timer(self, duration: int, callback):
        self.cancel_timer()

        async def tick():
            self.time_left = duration
            while self.time_left > 0:
                await asyncio.sleep(1)
                self.time_left -= 1
                if self.phase == "drawing":
                    await self.broadcast_timer()
            await callback()

        self.timer_task = asyncio.create_task(tick())

    def cancel_timer(self):
        if self.timer_task and not self.timer_task.done():
            self.timer_task.cancel()
        self.timer_task = None

    # --- Broadcasting ---

    async def send(self, player: Player, data: dict):
        try:
            await player.websocket.send(json.dumps(data))
        except Exception:
            pass

    async def broadcast(self, data: dict):
        msg = json.dumps(data)
        for p in list(self.players.values()):
            try:
                await p.websocket.send(msg)
            except Exception:
                pass

    async def broadcast_chat(self, username: str, text: str):
        await self.broadcast({
            "type": "chat",
            "username": username,
            "text": text,
        })

    async def broadcast_system_message(self, text: str):
        await self.broadcast({
            "type": "system",
            "text": text,
        })

    async def broadcast_player_list(self):
        players = [
            {
                "id": p.id,
                "username": p.username,
                "score": p.score,
                "isDrawing": p.is_drawing,
                "hasGuessed": p.has_guessed,
            }
            for p in self.players.values()
        ]
        await self.broadcast({"type": "player_list", "players": players})

    async def broadcast_timer(self):
        data: dict = {
            "type": "timer",
            "timeLeft": self.time_left,
        }
        if self.phase == "drawing":
            hint = self.get_hint()
            data["hint"] = hint
        await self.broadcast(data)

    async def broadcast_game_state(self):
        drawer = self.players.get(self.current_drawer_id) if self.current_drawer_id else None

        base = {
            "type": "game_state",
            "phase": self.phase,
            "round": self.round,
            "totalRounds": self.TOTAL_ROUNDS,
            "timeLeft": self.time_left,
            "drawerId": self.current_drawer_id,
            "drawerName": drawer.username if drawer else None,
        }

        for p in list(self.players.values()):
            state = dict(base)
            if self.phase == "drawing" and p.id == self.current_drawer_id:
                state["word"] = self.current_word
            elif self.phase == "drawing":
                state["hint"] = self.get_hint()
            elif self.phase == "turn_end":
                state["word"] = self.current_word

            await self.send(p, state)
