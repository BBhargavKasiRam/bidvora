import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";
import { useAuth } from "../context/AuthContext";
import { Send, Lock } from "lucide-react";
import { api } from "../lib/api";

export const PrivateChat = ({ auctionId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch chat history
    api.get(`/auctions/${auctionId}/mediator-messages`)
      .then((data) => {
        setMessages(data.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          text: m.message,
          timestamp: m.created_at
        })));
      })
      .catch(console.error);

    const socket = getSocket();

    socket.on("receive-mediator-message", (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => {
      socket.off("receive-mediator-message");
    };
  }, [auctionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const messageData = {
      id: Date.now() + Math.random(),
      senderId: user.id,
      senderName: user.name,
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      await api.post(`/auctions/${auctionId}/mediator-messages`, { message: inputText.trim() });
      getSocket().emit("send-mediator-message", { auctionId, messageData });
      setMessages((prev) => [...prev, messageData]);
      setInputText("");
    } catch (err) {
      console.error("Failed to send private message", err);
    }
  };

  return (
    <div className="flex flex-col h-[400px] border border-gold/30 bg-white">
      <div className="p-4 border-b border-gold/30 bg-amber-50">
        <h3 className="text-xs uppercase tracking-widest font-bold flex items-center gap-2 text-amber-800">
          <Lock className="w-3.5 h-3.5" />
          Private Coordination Chat
        </h3>
        <p className="text-[9px] text-amber-700/70 uppercase tracking-widest mt-1">Only visible to Consignor & Auctioneer</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`text-sm flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">{isMe ? "You" : msg.senderName}</span>
              <div className={`px-4 py-2 ${isMe ? "bg-ink text-paper" : "bg-paper border border-ink/10"}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gold/30 bg-amber-50">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Secure message..."
            className="flex-1 px-3 py-2 text-sm border border-gold/30 outline-none focus:border-gold"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
