require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path"); // Added for reliable file paths
const { Server } = require("socket.io");
const db = require("./config/db"); // For socket DB queries

const app = express();
const server = http.createServer(app);

// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: frontendUrl,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

// FIXED: Serving static files using absolute path to ensure images show up
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── ROUTES ─────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const bidRoutes = require("./routes/bidRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require("./routes/chatRoutes");
const mediatorRoutes = require("./routes/mediatorRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/mediator", mediatorRoutes);

// ─── SOCKET.IO: REAL-TIME BIDDING + WEBRTC SIGNALING ────────────────────────
const broadcasters = {}; // auctionId → socketId

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ── Auction Room Management ──
  socket.on("joinAuction", (auctionId) => {
    socket.join(`auction:${auctionId}`);
    console.log(`Socket ${socket.id} joined auction:${auctionId}`);

    // Notify the user immediately if a live stream is already active
    if (broadcasters[auctionId]) {
      socket.emit("broadcaster-present", { broadcasterId: broadcasters[auctionId] });
    }
  });

  socket.on("leaveAuction", (auctionId) => {
    socket.leave(`auction:${auctionId}`);
  });

  // Relay a new bid to all other users in the room
  socket.on("bidPlaced", ({ auctionId, bidData }) => {
    // We use io.to instead of socket.to so the sender ALSO gets the update if needed,
    // or keep socket.to to let the sender handle their own state.
    socket.to(`auction:${auctionId}`).emit("newBid", bidData);
  });

  // Anti-snipe timer extension relay
  // Updated to match frontend expectations for extensionMinutes
  socket.on("timerExtended", ({ auctionId, newEndTime, extensionMinutes }) => {
    io.to(`auction:${auctionId}`).emit("timerExtended", { 
      newEndTime, 
      extensionMinutes: extensionMinutes || 3 
    });
  });

  // ── WebRTC Video Streaming Logic ──
  
  // Seller starts broadcasting
  socket.on("start-broadcast", ({ auctionId }) => {
    broadcasters[auctionId] = socket.id;
    socket.join(`auction:${auctionId}`);
    // Notify all viewers in the room that seller is live
    socket.to(`auction:${auctionId}`).emit("broadcaster-present", {
      broadcasterId: socket.id,
    });
    console.log(`Broadcaster started for auction ${auctionId}: ${socket.id}`);
  });

  // Viewer is ready to watch and needs a handshake
  socket.on("viewer-ready", ({ auctionId, viewerId }) => {
    const broadcasterId = broadcasters[auctionId];
    if (broadcasterId) {
      // Direct the broadcaster to start WebRTC handshake with this specific viewer
      io.to(broadcasterId).emit("new-viewer", { viewerId });
    }
  });

  // WebRTC Signal Relay (Offer)
  socket.on("offer", ({ targetId, offer, senderId }) => {
    io.to(targetId).emit("offer", { offer, senderId });
  });

  // WebRTC Signal Relay (Answer)
  socket.on("answer", ({ targetId, answer, senderId }) => {
    io.to(targetId).emit("answer", { answer, senderId });
  });

  // WebRTC Signal Relay (ICE Candidates)
  socket.on("ice-candidate", ({ targetId, candidate, senderId }) => {
    io.to(targetId).emit("ice-candidate", { candidate, senderId });
  });

  // Seller manually ends broadcast
  socket.on("broadcast-ended-notify", ({ auctionId }) => {
    if (broadcasters[auctionId] === socket.id) {
      delete broadcasters[auctionId];
      io.to(`auction:${auctionId}`).emit("broadcast-ended");
    }
  });

  // Handle Disconnection
  socket.on("disconnect", () => {
    // If the disconnected socket was a broadcaster, notify the room
    for (const [auctionId, broadcasterId] of Object.entries(broadcasters)) {
      if (broadcasterId === socket.id) {
        delete broadcasters[auctionId];
        io.to(`auction:${auctionId}`).emit("broadcast-ended");
        console.log(`Broadcaster for auction ${auctionId} disconnected`);
      }
    }
    console.log("Socket disconnected:", socket.id);
  });

  // ── Chat & Mediator Logic ──
  socket.on("sendChatMessage", ({ auctionId, userId, message, isSystemMessage, user }) => {
    db.query("SELECT id FROM muted_users WHERE auction_id = ? AND user_id = ?", [auctionId, userId], (err, results) => {
        if (!err && results.length > 0) {
            socket.emit("chatError", { message: "You are muted in this room." });
            return;
        }

        const query = `INSERT INTO chat_messages (auction_id, user_id, message, is_system_message) VALUES (?, ?, ?, ?)`;
        db.query(query, [auctionId, userId || null, message, isSystemMessage ? 1 : 0], (err, result) => {
            if (err) {
              console.error("Chat Error:", err);
              return;
            }
            
            const newMessage = {
                id: result.insertId,
                auction_id: auctionId,
                user_id: userId,
                message,
                is_system_message: isSystemMessage ? 1 : 0,
                created_at: new Date(),
                user_name: user?.name || (isSystemMessage ? "System" : "Unknown"),
                user_role: user?.role || "system"
            };

            io.to(`auction:${auctionId}`).emit("newChatMessage", newMessage);
        });
    });
  });

  socket.on("deleteChatMessage", ({ auctionId, messageId }) => {
    db.query("DELETE FROM chat_messages WHERE id = ? AND auction_id = ?", [messageId, auctionId], (err) => {
        if (!err) {
            io.to(`auction:${auctionId}`).emit("chatMessageDeleted", { messageId });
        }
    });
  });

  socket.on("muteUser", ({ auctionId, targetUserId, mediatorId }) => {
    db.query("INSERT INTO muted_users (auction_id, user_id, muted_by) VALUES (?, ?, ?)", [auctionId, targetUserId, mediatorId], (err) => {
        if (!err) {
            io.to(`auction:${auctionId}`).emit("userMuted", { userId: targetUserId });
        }
    });
  });

  socket.on("mediatorJoined", ({ auctionId }) => {
     io.to(`auction:${auctionId}`).emit("mediatorPresence", { isPresent: true });
  });

  socket.on("mediatorLeft", ({ auctionId }) => {
     io.to(`auction:${auctionId}`).emit("mediatorPresence", { isPresent: false });
  });

});


// ─── START SERVER ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});