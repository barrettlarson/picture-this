import React, { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage, GamePhase } from "./types";

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  disabled: boolean;
  phase: GamePhase;
}

const Chat: React.FC<ChatProps> = ({ messages, onSend, disabled, phase }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  }

  return (
    <div className="chat">
      <div id="messages">
        {messages.map((m, i) => {
          let className = i % 2 === 0 ? "message-even" : "message-odd";
          if (m.type === "system") className += " message-system";
          if (m.type === "correct") className += " message-correct";
          if (m.type === "close") className += " message-close";

          return (
            <div key={m.id} className={className}>
              {m.type === "chat" && <strong>{m.username}: </strong>}
              {m.type === "chat" ? m.text : m.text}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <input
        id="message-input"
        type="text"
        placeholder={
          disabled
            ? "You are drawing!"
            : phase === "lobby"
              ? "Chat..."
              : "Type your guess here..."
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
};

export default Chat;
