const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const client = require("../connection.js");

client.connect();
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.set('trust proxy', 1);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// MongoDB Schema for Chat
const ChatSchema = new mongoose.Schema({
  username: String,
  group: String,
  message: String,
  role: String,
  timestamp: { type: Date, default: Date.now },
});
const Chat = mongoose.model("chat", ChatSchema, "chat");

async function getRazred(googleId, role) {
  try {
    if (role === 'učenik'){
      const res = await client.query(
        `SELECT razred FROM UČENIK WHERE uČenik.učenikId = $1`,
        [googleId]
      );
      return res.rows.length > 0 ? res.rows[0].razred : null;
    }
    else{
      const res = await client.query(
        `SELECT razrednik FROM DJELATNIK WHERE djelatnik.djelatnikId = $1`,
        [googleId]
      );
      return res.rows.length > 0 ? res.rows[0].razrednik : null;
    }
  } catch (err) {
    console.error("Error fetching razred:", err);
    throw err;
  }
}

// API Endpoint to Fetch Group (Razred)
app.post("/getRazred", async (req, res) => {
  const { googleId, role } = req.body; // Retrieve data from the request body
  try {
    const razred = await getRazred(googleId, role);
    if (razred) {
      res.json({ razred });
    } else {
      res.status(404).json({ error: "Razred not found for user" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API Endpoint to Get Messages by Group from MongoDB
app.get("/messages/:group", async (req, res) => {
  const { group } = req.params;
  try {
    const messages = await Chat.find({ group }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages from MongoDB:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Serve the Chat Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// WebSocket Events
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join Group Event
  socket.on("joinGroup", async (googleId, role) => {
    try {
      const group = await getRazred(googleId, role);
      if (group) {
        socket.join(group);
        console.log(`User joined group: ${group}`);
      } else {
        console.log("Group not found for user:", googleId);
      }
    } catch (err) {
      console.error("Error joining group:", err);
    }
  });

  // Send Message Event
  socket.on("sendMessage", async (data) => {
    const { googleId, username, message, role} = data;
    try {
      const group = await getRazred(googleId, role);
      if (group) {
        const newMessage = new Chat({ username, group, message });
        await newMessage.save();
        io.to(group).emit("receiveMessage", newMessage);
      } else {
        console.log("Cannot send message, group not found for user:", username);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // Disconnect Event
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the Server
server.listen(3002, () => {
  console.log("Server running on http://localhost:3002");
});
