import type { GamePhase } from "./types";

interface GameHeaderProps {
  timeLeft: number;
  word: string;
  round: number;
  totalRounds: number;
  label: string;
  phase: GamePhase;
}

function GameHeader({ timeLeft, word, round, totalRounds, label, phase }: GameHeaderProps) {
  const letters = word.split("");
  const letterCount = letters.filter((l) => l !== " ").length;

  if (phase === "lobby") return null;

  return (
    <div className="game-header">
      <div className="timer">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle
            cx="32"
            cy="35"
            r="26"
            stroke="#fff"
            strokeWidth="3"
            fill="rgba(255,255,255,0.15)"
          />
          <rect x="26" y="4" width="12" height="6" rx="2" fill="#fff" />
          <line x1="20" y1="12" x2="16" y2="8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="44" y1="12" x2="48" y2="8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="timer-number">{timeLeft}</span>
      </div>
      <div className="guess">
        <p className="guess-label">{label}</p>
        <div className="letter-slots">
          {letters.map((letter, i) =>
            letter === " " ? (
              <div key={i} className="letter-space" />
            ) : (
              <div key={i} className="letter-slot">
                {letter !== "_" ? letter : ""}
              </div>
            ),
          )}
          {letterCount > 0 && <span className="letter-count">{letterCount}</span>}
        </div>
      </div>
      {round > 0 && (
        <div className="round-info">
          Round {round}/{totalRounds}
        </div>
      )}
    </div>
  );
}

export default GameHeader;
