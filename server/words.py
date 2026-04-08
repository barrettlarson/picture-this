import random

WORDS = [
    "apple", "banana", "cherry", "grape", "lemon", "mango", "orange", "peach",
    "pear", "strawberry", "watermelon", "pineapple", "coconut", "avocado",
    "dog", "cat", "elephant", "giraffe", "lion", "tiger", "monkey", "penguin",
    "dolphin", "whale", "shark", "octopus", "butterfly", "spider", "snake",
    "eagle", "parrot", "rabbit", "turtle", "frog", "horse", "chicken", "bear",
    "house", "castle", "bridge", "lighthouse", "skyscraper", "tent", "igloo",
    "pyramid", "church", "windmill", "barn", "cabin",
    "car", "bicycle", "airplane", "helicopter", "rocket", "submarine", "train",
    "bus", "motorcycle", "sailboat", "canoe", "skateboard", "scooter",
    "guitar", "piano", "drum", "violin", "trumpet", "microphone", "headphones",
    "camera", "telescope", "microscope", "compass", "clock", "hourglass",
    "umbrella", "sunglasses", "hat", "crown", "ring", "necklace", "backpack",
    "suitcase", "wallet", "key", "lock", "ladder", "hammer", "scissors",
    "paintbrush", "pencil", "book", "newspaper", "envelope", "mailbox",
    "pizza", "hamburger", "hotdog", "taco", "sandwich", "cookie", "cake",
    "donut", "icecream", "popcorn", "sushi", "egg", "bread", "cheese",
    "sun", "moon", "star", "cloud", "rainbow", "lightning", "snowflake",
    "tornado", "volcano", "mountain", "island", "waterfall", "ocean", "desert",
    "tree", "flower", "cactus", "mushroom", "leaf", "rose", "sunflower",
    "football", "basketball", "baseball", "tennis", "bowling", "golf",
    "soccer", "hockey", "boxing", "surfing", "skiing", "fishing",
    "candle", "flashlight", "lantern", "campfire", "fireworks",
    "robot", "alien", "ghost", "dragon", "unicorn", "mermaid", "wizard",
    "pirate", "knight", "ninja", "astronaut", "cowboy", "clown",
    "anchor", "balloon", "bell", "bomb", "bone", "brain", "broom",
    "bucket", "chair", "couch", "table", "bed", "lamp", "television",
    "refrigerator", "oven", "bathtub", "toilet", "window", "door",
    "fence", "swing", "slide", "trampoline", "kite", "parachute",
]


def get_word_choices(count=3):
    return random.sample(WORDS, count)
