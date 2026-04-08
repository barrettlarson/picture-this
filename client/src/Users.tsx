import type { Player } from "./types";

interface UsersProps {
  players: Player[];
}

function Users({ players }: UsersProps) {
  return (
    <div className="users">
      {players.map((p) => (
        <div
          key={p.id}
          className={`user ${p.isDrawing ? "user-drawing" : ""} ${p.hasGuessed ? "user-guessed" : ""}`}
        >
          <img src="https://static.thenounproject.com/png/2062361-200.png" alt="" />
          <div className="user-info">
            <p className="user-name">
              {p.username}
              {p.isDrawing && <span className="drawing-badge">Drawing</span>}
            </p>
            <p className="user-score">{p.score} pts</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Users;
