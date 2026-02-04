import React, { useState, type FormEvent } from "react";

const Chat: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const username = "testuser";

  function postMessage(e: FormEvent) {
    e.preventDefault();
    const message = username + ": " + input.trim();
    if (!message) return;
    setMessages((prev) => [...prev, message]);
    setInput("");
    console.log("Message sent!");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      postMessage(e as unknown as FormEvent);
    }
  }

  return (
    <>
      <div className="chat">
        <div id="messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={i % 2 === 0 ? "message-even" : "message-odd"}
            >
              {m}
            </div>
          ))}
        </div>
        <input
          id="message-input"
          type="text"
          placeholder="Type your guess here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </div>
    </>
  );
};

export default Chat;
