interface WordPickerProps {
  words: string[];
  timeLeft: number;
  onPick: (word: string) => void;
}

function WordPicker({ words, timeLeft, onPick }: WordPickerProps) {
  return (
    <div className="word-picker-overlay">
      <div className="word-picker">
        <h2>Choose a word to draw!</h2>
        <p className="word-picker-timer">Time left: {timeLeft}s</p>
        <div className="word-picker-options">
          {words.map((word) => (
            <button key={word} onClick={() => onPick(word)}>
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WordPicker;
