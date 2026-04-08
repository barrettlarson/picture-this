from dataclasses import dataclass, field


@dataclass
class Player:
    id: str
    username: str
    websocket: object
    score: int = 0
    has_guessed: bool = False
    is_drawing: bool = False
