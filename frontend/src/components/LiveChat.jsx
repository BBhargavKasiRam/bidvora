import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";
import { useAuth } from "../context/AuthContext";
import { Send } from "lucide-react";

export const LiveChat = ({ auctionId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on("receive-chat-message", (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => {
      socket.off("receive-chat-message");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const messageData = {
      id: Date.now() + Math.random(),
      senderId: user.id,
      senderName: user.name,
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    getSocket().emit("send-chat-message", { auctionId, messageData });
    setMessages((prev) => [...prev, messageData]);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-[500px] border border-ink/10 bg-white">
      <div className="p-4 border-b border-ink/10 bg-paper/50">
        <h3 className="text-xs uppercase tracking-widest font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Live Chat
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-bold text-ink mr-2">{msg.senderName}</span>
            <span className="text-ink/80">{msg.text}</span>
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
