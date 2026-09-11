import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, User, Building2, Package } from "lucide-react";
import api, { getImageUrl } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const MessagesPage = () => {
  const { user } = useAuth();
  const { toast } = useNotification();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    try {
      const { data } = await api.get("/chat/conversations");
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const { data } = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation._id);
      const msgInterval = setInterval(() => loadMessages(activeConversation._id), 4000);
      return () => clearInterval(msgInterval);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    try {
      const { data } = await api.post(`/chat/conversations/${activeConversation._id}/messages`, {
        message: newMessage.trim(),
      });
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
      loadConversations();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return null;
    return conv.participants.find((p) => p._id !== user._id) || conv.participants[0];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden h-[75vh] flex">
        {/* Left: Conversations List */}
        <div className="w-full md:w-80 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-500" /> Messages
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No active conversations yet. Click "Chat" on any item page to reach out.
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = activeConversation?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "bg-brand-50/60 dark:bg-brand-950/30"
                        : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {other?.name ? other.name.slice(0, 2).toUpperCase() : "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {other?.name || "Student"}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-brand-500" />
                        )}
                      </div>
                      {conv.item && (
                        <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium truncate">
                          📦 {conv.item.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                        {conv.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Conversation */}
        <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-zinc-950/40">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
                    {getOtherParticipant(activeConversation)?.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {getOtherParticipant(activeConversation)?.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {getOtherParticipant(activeConversation)?.hostel || "Campus peer"}
                    </p>
                  </div>
                </div>

                {activeConversation.item && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 text-xs">
                    <Package className="w-3.5 h-3.5 text-brand-500" />
                    <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate max-w-[150px]">
                      {activeConversation.item.name}
                    </span>
                    <span className="text-brand-600 font-bold">
                      ₹{activeConversation.item.pricePerDay}/day
                    </span>
                  </div>
                )}
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isMe = m.sender?._id === user._id || m.sender === user._id;
                  return (
                    <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? "bg-brand-600 text-white rounded-br-sm shadow-sm"
                            : "bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-800 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <p>{m.message}</p>
                        <span
                          className={`text-[10px] mt-1 block ${
                            isMe ? "text-brand-100 text-right" : "text-gray-400"
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a message to coordinate handover..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-xs focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
