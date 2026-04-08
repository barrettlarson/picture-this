import asyncio
import json

from websockets.asyncio.server import serve

from game import Game

game = Game()


async def handler(websocket):
    player = None
    try:
        async for raw in websocket:
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")

            if msg_type == "join":
                username = data.get("username", "").strip()
                if not username or len(username) > 20:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Username must be 1-20 characters",
                    }))
                    continue

                result = await game.add_player(websocket, username)
                if isinstance(result, str):
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": result,
                    }))
                else:
                    player = result
                continue

            if not player:
                continue

            if msg_type == "pick_word":
                await game.pick_word(player.id, data.get("word", ""))

            elif msg_type == "guess":
                text = data.get("text", "").strip()
                if text:
                    await game.handle_guess(player, text)

            elif msg_type == "draw":
                await game.handle_draw(player, {
                    "x": data.get("x"),
                    "y": data.get("y"),
                    "color": data.get("color"),
                    "size": data.get("size"),
                    "newStroke": data.get("newStroke", False),
                })

            elif msg_type == "fill":
                await game.handle_fill(player, {
                    "x": data.get("x"),
                    "y": data.get("y"),
                    "color": data.get("color"),
                })

            elif msg_type == "undo":
                await game.handle_undo(player)

            elif msg_type == "clear":
                await game.handle_clear(player)

    except Exception:
        pass
    finally:
        if player:
            await game.remove_player(player.id)


async def main():
    async with serve(handler, "", 8001) as server:
        print("PictureThis! server running on ws://localhost:8001")
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
