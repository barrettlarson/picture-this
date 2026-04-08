interface ScoreboardProps {
  results: { username: string; score: number }[];
}

function Scoreboard({ results }: ScoreboardProps) {
  return (
    <div className="scoreboard-overlay">
      <div className="scoreboard">
        <h2>Game Over!</h2>
        <div className="scoreboard-list">
          {results.map((r, i) => (
            <div key={r.username} className={`scoreboard-row ${i === 0 ? "winner" : ""}`}>
              <span className="scoreboard-rank">#{i + 1}</span>
              <span className="scoreboard-name">{r.username}</span>
              <span className="scoreboard-score">{r.score} pts</span>
            </div>
          ))}
        </div>
        <p className="scoreboard-hint">Next game starting soon...</p>
      </div>
    </div>
  );
}

export default Scoreboard;
