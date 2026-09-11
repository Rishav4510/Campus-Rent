const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

// @route POST /api/chat/start
const startConversation = async (req, res) => {
  try {
    const { recipientId, itemId } = req.body;
    if (!recipientId) return res.status(400).json({ message: "Recipient ID is required" });

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot start a conversation with yourself" });
    }

    let query = {
      participants: { $all: [req.user._id, recipientId] },
    };
    if (itemId) query.item = itemId;

    let conversation = await Conversation.findOne(query)
      .populate("participants", "name email profileImage hostel rating")
      .populate("item", "name image pricePerDay category");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        item: itemId || undefined,
        lastMessage: {
          text: "Conversation started",
          sender: req.user._id,
          createdAt: new Date(),
        },
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name email profileImage hostel rating")
        .populate("item", "name image pricePerDay category");
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/chat/conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "name email profileImage hostel rating")
      .populate("item", "name image pricePerDay category")
      .sort({ updatedAt: -1 });

    // Attach unread counts for each conversation
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          read: false,
        });
        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/chat/conversations/:id/messages
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized to view this conversation" });
    }

    // Mark unread messages sent by others as read
    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        read: false,
      },
      { read: true }
    );

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "name profileImage")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/chat/conversations/:id/messages
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized to post to this conversation" });
    }

    const newMsg = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      message: message.trim(),
      read: false,
    });

    // Update lastMessage on conversation
    conversation.lastMessage = {
      text: message.trim(),
      sender: req.user._id,
      createdAt: new Date(),
    };
    await conversation.save();

    // Identify recipient to send notification
    const recipientId = conversation.participants.find((p) => p.toString() !== req.user._id.toString());
    if (recipientId) {
      await Notification.create({
        user: recipientId,
        type: "new_message",
        title: `Message from ${req.user.name}`,
        message: message.trim().slice(0, 80),
        link: `/messages`,
      });
    }

    const populated = await Message.findById(newMsg._id).populate("sender", "name profileImage");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { startConversation, getConversations, getMessages, sendMessage };
