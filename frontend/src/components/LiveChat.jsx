import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";
import { useAuth } from "../context/AuthContext";
import { Send } from "lucide-react";
import { api } from "../lib/api";

export const LiveChat = ({ auctionId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch chat history
    api.get(`/chat/${auctionId}`)
      .then((data) => {
        if (data && data.messages) {
          const formattedMessages = data.messages.map(m => ({
            id: m.id,
            senderId: m.user_id,
            senderName: m.user_name || (m.is_system_message ? "System" : "Unknown"),
            text: m.message,
            timestamp: m.created_at,
            isSystem: m.is_system_message
          }));
          setMessages(formattedMessages);
        }
      })
      .catch(console.error);

    const socket = getSocket();

    socket.on("newChatMessage", (m) => {
      const formattedMessage = {
        id: m.id,
        senderId: m.user_id,
        senderName: m.user_name || (m.is_system_message ? "System" : "Unknown"),
        text: m.message,
        timestamp: m.created_at,
        isSystem: m.is_system_message
      };
      setMessages((prev) => [...prev, formattedMessage]);
    });

    socket.on("chatError", ({ message }) => {
      alert(message);
    });

    return () => {
      socket.off("newChatMessage");
      socket.off("chatError");
    };
  }, [auctionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    getSocket().emit("sendChatMessage", { 
      auctionId, 
      userId: user.id, 
      message: inputText.trim(), 
      isSystemMessage: false, 
      user 
    });
    
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full min-h-[300px] max-h-[500px] border border-ink/10 bg-white">
      <div className="p-4 border-b border-ink/10 bg-paper/50">
        <h3 className="text-xs uppercase tracking-widest font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live Chat
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`text-sm ${msg.isSystem ? 'text-center italic text-ink/50 text-xs my-2' : ''}`}>
            {!msg.isSystem && <span className="font-bold text-ink mr-2">{msg.senderName}</span>}
            <span className={msg.isSystem ? '' : 'text-ink/80'}>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-ink/10 bg-paper/30">
        {user ? (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Say something..."
              className="flex-1 px-3 py-2 text-sm border border-ink/10 outline-none focus:border-gold"
              maxLength={200}
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-ink text-white hover:bg-gold disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center text-xs text-ink/40 p-2">
            Sign in to chat
          </div>
        )}
      </div>
    </div>
  );
};
