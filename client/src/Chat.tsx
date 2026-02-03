import React, { useState, type FormEvent } from "react";

const Chat: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  function postMessage(e: FormEvent) {
    e.preventDefault();
    const message = input.trim();
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
            <div key={i}>{m}</div>
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
