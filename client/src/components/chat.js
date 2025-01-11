import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import chatStyles from "../styles/pocetna/chat.css";

const stringToColor = (string) => {
  //odreduje nasumicnu boju za svakog user-a prema username-u, uzima u obzir vrijednost svakog char-a u stringu
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + (hash << (5 - hash));
  }
  return `hsl(${hash % 360}, 70%, 50%)`;
};

const Chat = ({
  user,
  group = "general",
  serverUrl = "http://localhost:3002",
}) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const socket = io(serverUrl);

    socket.emit("joinGroup", group);

    fetch(`${serverUrl}/messages/${group}`)
      .then((res) => res.json())
      .then((data) => setMessages(data));

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, group, serverUrl]);

  const sendMessage = () => {
    if (message.trim()) {
      const socket = io(serverUrl);
      const username = `${user.name} ${user.surname}`;
      socket.emit("sendMessage", { username, group, message });
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="chat-container">
      <div id="messages">
        {messages.map((msg, index) => {
          const isUserMessage = msg.username === `${user.name} ${user.surname}`;
          return (
            <div
              key={index}
              className={`message ${
                isUserMessage ? "user-message" : "other-message"
              }`}
            >
              <strong style={{ color: stringToColor(msg.username) }}>
                {msg.username}:
              </strong>{" "}
              {msg.message}
            </div>
          );
        })}
      </div>
      <div id="send-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Upišite poruku"
        />
        <button onClick={sendMessage}>Pošalji</button>
      </div>
    </div>
  );
};

export default Chat;
