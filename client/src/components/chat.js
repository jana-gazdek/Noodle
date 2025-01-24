import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "../styles/pocetna/chat.css";

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + (hash << (5 - hash));
  }
  return `hsl(${hash % 360}, 70%, 50%)`;
};

const Chat = ({ 
  user, 
  serverUrl = "https://noodle-chat.onrender.com" 
}) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [group, setGroup] = useState(null);
  const [error, setError] = useState(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchGroup = async () => {
      try {
        const response = await fetch(`${serverUrl}/getRazred`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            googleId: user.googleId,
            role: user.role,
          }),
        });
        


        if (response.ok) {
          const data = await response.json();
          setGroup(data.razred);
        } else {
          console.error("Failed to fetch razred");
        }
      } catch (err) {
        console.error("Error fetching group:", err.message);
        setError("Ne radi. 😔");
      }
    };

    fetchGroup();
  }, [user, serverUrl]);

  useEffect(() => {
    if (!group || !user) return;

    const socket = io(serverUrl, {
      reconnectionAttempts: 5,
    });

    socket.on("connect_error", () => {
      setError("Ne radi. 😔");
    });

    try {
      socket.emit("joinGroup", user.googleId, user.role);

      fetch(`${serverUrl}/messages/${group}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch messages");
          }
          return res.json();
        })
        .then((data) => setMessages(data))
        .catch((err) => {
          console.error("Error fetching messages:", err.message);
          setError("Ne radi. 😔");
        });

      socket.on("receiveMessage", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    } catch (err) {
      console.error("Error initializing chat:", err.message);
      setError("Ne radi. 😔");
    }

    return () => {
      socket.disconnect();
    };
  }, [user, group, serverUrl]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const socket = io(serverUrl);
      const username = `${user.name} ${user.surname}`;
      const googleId = user.googleId;
      const role = user.role;
      socket.emit("sendMessage", { googleId, username, group, message, role});
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  if (!user) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="chat-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div id="messages" ref={messagesRef}>
        {messages.map((msg, index) => {
          const isUserMessage = msg.username === (user.name + " " + user.surname);
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