const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
require("dotenv").config();


// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB!"))
.catch((err) => console.error("Error connecting to MongoDB:", err));

const ChatSchema = new mongoose.Schema({
  username: String,
  group: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Chat = mongoose.model("chat", ChatSchema, "chat");

// REST API to fetch messages by group
app.get("/messages/:group", async (req, res) => {
  const { group } = req.params;
  const messages = await Chat.find({ group }).sort({ timestamp: 1 });
  res.json(messages);
});

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Socket.io Communication
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinGroup", (group) => {
    socket.join(group);
    console.log(`User joined group: ${group}`);
  });

  socket.on("sendMessage", async (data) => {
    const { username, group, message } = data;
    const newMessage = new Chat({ username, group, message });
    await newMessage.save();
    io.to(group).emit("receiveMessage", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start server on port 3002
server.listen(3002, () => {
  console.log("Server running on http://localhost:3002");
});
