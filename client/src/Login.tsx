import { useState, type FormEvent } from "react";

interface LoginProps {
  onJoin: (username: string) => void;
  error: string | null;
  connected: boolean;
}

function Login({ onJoin, error, connected }: LoginProps) {
  const [username, setUsername] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = username.trim();
    if (name) onJoin(name);
  }

  return (
    <div className="login-screen">
      <h1 className="login-title">PictureThis!</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          autoFocus
          autoComplete="off"
        />
        <button type="submit" disabled={!username.trim() || !connected}>
          Play!
        </button>
        {error && <p className="login-error">{error}</p>}
        {!connected && <p className="login-status">Connecting to server...</p>}
      </form>
    </div>
  );
}

export default Login;
