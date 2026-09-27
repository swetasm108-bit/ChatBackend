require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const app = express();
const messageRoutes = require("./routes/messageRoutes");

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/messages", messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Chat backend is running");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);
  });

socket.on("send_message", async (data) => {
  try {
    console.log("Message received:", data);

    const savedMessage = await Message.create({
      roomId: data.roomId,
      sender: data.sender,
      message: data.message,
    });

    io.to(data.roomId).emit("receive_message", savedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
  }
});
socket.on("edit_message", async (data) => {
  try {
    const { messageId, sender, newMessage } = data;

if (!newMessage || !newMessage.trim()) {
  socket.emit("edit_error", {
    message: "Message cannot be empty",
  });
  return;
}

    const existingMessage = await Message.findById(messageId);

    if (!existingMessage) {
      socket.emit("edit_error", {
        message: "Message not found",
      });
      return;
    }

    if (existingMessage.sender !== sender) {
      socket.emit("edit_error", {
        message: "You can only edit your own messages",
      });
      return;
    }

    const currentTime = Date.now();
    const createdTime = new Date(existingMessage.createdAt).getTime();

    const fiveMinutes = 5 * 60 * 1000;

    if (currentTime - createdTime > fiveMinutes) {
      socket.emit("edit_error", {
        message: "Messages can only be edited within 5 minutes",
      });
      return;
    }

    existingMessage.message = newMessage;
    existingMessage.edited = true;

    const updatedMessage = await existingMessage.save();

    io.to(existingMessage.roomId).emit(
      "message_edited",
      updatedMessage
    );
  } catch (error) {
    console.error("Error editing message:", error);

    socket.emit("edit_error", {
      message: "Failed to edit message",
    });
  }
});
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});