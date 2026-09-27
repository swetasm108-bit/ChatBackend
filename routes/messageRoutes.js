const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// Send/save a message
router.post("/", async (req, res) => {
  try {
    const { roomId, sender, message } = req.body;

    if (!roomId || !sender || !message) {
      return res.status(400).json({
        message: "roomId, sender and message are required",
      });
    }

    const newMessage = await Message.create({
      roomId,
      sender,
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);

    res.status(500).json({
      message: "Failed to save message",
    });
  }
});

// Get chat history
router.get("/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({
      roomId: req.params.roomId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);

    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
});

module.exports = router;