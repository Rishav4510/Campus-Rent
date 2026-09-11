const express = require("express");
const router = express.Router();
const {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.post("/start", protect, startConversation);
router.get("/conversations", protect, getConversations);
router.get("/conversations/:id/messages", protect, getMessages);
router.post("/conversations/:id/messages", protect, sendMessage);

module.exports = router;
