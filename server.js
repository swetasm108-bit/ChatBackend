require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Message = require("./models/Message");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);

connectDB();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Chat backend is running");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ==========================================
  // JOIN ROOM
  // ==========================================
  socket.on("join_room", ({ roomId, username }) => {
    try {
      if (!roomId || !username) {
        console.log("Invalid join_room data");
        return;
      }

      socket.join(roomId);

      socket.data.roomId = roomId;
      socket.data.username = username;

      console.log(
        `${username} joined room ${roomId}`
      );

      // ------------------------------------------
      // Tell the NEW USER who is already online
      // in this room.
      // ------------------------------------------
      const roomSockets =
        io.sockets.adapter.rooms.get(roomId);

      if (roomSockets) {
        roomSockets.forEach((socketId) => {
          if (socketId === socket.id) {
            return;
          }

          const existingSocket =
            io.sockets.sockets.get(socketId);

          if (
            existingSocket &&
            existingSocket.data.username
          ) {
            socket.emit("user_status", {
              username:
                existingSocket.data.username,
              status: "online",
              lastSeen: null,
            });
          }
        });
      }

      // ------------------------------------------
      // Tell EVERY OTHER USER that this user
      // is now online.
      // ------------------------------------------
      socket.to(roomId).emit(
        "user_status",
        {
          username,
          status: "online",
          lastSeen: null,
        }
      );
    } catch (error) {
      console.error(
        "Join room error:",
        error
      );
    }
  });

  // ==========================================
  // SEND MESSAGE
  // ==========================================
  socket.on("send_message", async (data) => {
    try {
      console.log(
        "SEND_MESSAGE received:",
        data
      );

      const {
        roomId,
        sender,
        message,
      } = data;

      if (
        !roomId ||
        !sender ||
        !message ||
        !message.trim()
      ) {
        return;
      }

      const savedMessage =
        await Message.create({
          roomId,
          sender,
          message: message.trim(),
        });

      console.log(
        "Message saved:",
        savedMessage._id.toString()
      );

      io.to(roomId).emit(
        "receive_message",
        savedMessage
      );

      console.log(
        "Message broadcast complete"
      );
    } catch (error) {
      console.error(
        "SEND_MESSAGE ERROR:",
        error
      );

      socket.emit("message_error", {
        message: "Failed to send message",
      });
    }
  });

  // ==========================================
  // EDIT MESSAGE
  // ==========================================
  socket.on("edit_message", async (data) => {
    try {
      const {
        messageId,
        sender,
        newMessage,
      } = data;

      if (
        !messageId ||
        !sender ||
        !newMessage ||
        !newMessage.trim()
      ) {
        socket.emit("edit_error", {
          message: "Message cannot be empty",
        });

        return;
      }

      const existingMessage =
        await Message.findById(messageId);

      if (!existingMessage) {
        socket.emit("edit_error", {
          message: "Message not found",
        });

        return;
      }

      if (
        existingMessage.sender !== sender
      ) {
        socket.emit("edit_error", {
          message:
            "You can only edit your own messages",
        });

        return;
      }

      const currentTime = Date.now();

      const createdTime =
        new Date(
          existingMessage.createdAt
        ).getTime();

      const fiveMinutes =
        5 * 60 * 1000;

      if (
        currentTime - createdTime >
        fiveMinutes
      ) {
        socket.emit("edit_error", {
          message:
            "Messages can only be edited within 5 minutes",
        });

        return;
      }

      existingMessage.message =
        newMessage.trim();

      existingMessage.edited = true;

      const updatedMessage =
        await existingMessage.save();

      io.to(
        existingMessage.roomId
      ).emit(
        "message_edited",
        updatedMessage
      );
    } catch (error) {
      console.error(
        "Edit message error:",
        error
      );

      socket.emit("edit_error", {
        message: "Failed to edit message",
      });
    }
  });

  // ==========================================
  // LEAVE ROOM
  // ==========================================
  socket.on("leave_room", () => {
    const roomId = socket.data.roomId;
    const username =
      socket.data.username;

    if (!roomId || !username) {
      return;
    }

    const lastSeen =
      new Date().toISOString();

    console.log(
      `${username} left room ${roomId}`
    );

    socket.leave(roomId);

    // Tell remaining users this person
    // is now offline.
    io.to(roomId).emit(
      "user_status",
      {
        username,
        status: "offline",
        lastSeen,
      }
    );

    socket.data.roomId = null;
    socket.data.username = null;
  });

  // ==========================================
  // DISCONNECT
  // ==========================================
  socket.on("disconnect", (reason) => {
    const roomId = socket.data.roomId;
    const username =
      socket.data.username;

    console.log(
      "Socket disconnected:",
      socket.id,
      reason
    );

    if (roomId && username) {
      const lastSeen =
        new Date().toISOString();

      io.to(roomId).emit(
        "user_status",
        {
          username,
          status: "offline",
          lastSeen,
        }
      );
    }
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`);
});