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
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "http://localhost:5174",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(express.json());

// Firebase Popup Support
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors(corsOptions));
app.use(express.json());

// FIXED: Serving static files using absolute path to ensure images show up
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── ROUTES ─────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const bidRoutes = require("./routes/bidRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const chatRoutes = require("./routes/chatRoutes");
const mediatorRoutes = require("./routes/mediatorRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Initialize IO for controllers
const bidController = require("./controllers/bidController");
bidController.setIo(io);


app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/chat", chatRoutes);
app.use("/api/mediator", mediatorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);


// ─── SOCKET.IO: REAL-TIME BIDDING + WEBRTC SIGNALING ────────────────────────
const broadcasters = {}; // auctionId → socketId

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ── Auction Room Management ──
  socket.on("joinAuction", (auctionId) => {
    const aid = String(auctionId);
    socket.join(`auction:${aid}`);
    console.log(`Socket ${socket.id} joined auction:${aid}`);

    // Notify the user immediately if a live stream is already active
    if (broadcasters[aid]) {
      socket.emit("broadcaster-present", { broadcasterId: broadcasters[aid] });
    }
  });

  socket.on("leaveAuction", (auctionId) => {
    socket.leave(`auction:${auctionId}`);
  });

  // Relay a new bid to all other users in the room
  socket.on("bidPlaced", ({ auctionId, bidData }) => {
    socket.to(`auction:${auctionId}`).emit("newBid", bidData);
  });

  // ── Live Chat Relay ──
  socket.on("send-chat-message", ({ auctionId, messageData }) => {
    // messageData: { senderId, senderName, text, timestamp }
    socket.to(`auction:${String(auctionId)}`).emit("receive-chat-message", messageData);
  });

  // ── Mediator Private Chat Relay ──
  socket.on("send-mediator-message", ({ auctionId, messageData }) => {
    socket.to(`auction:${String(auctionId)}`).emit("receive-mediator-message", messageData);
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

  // Check stream status manually
  socket.on("check-stream-status", ({ auctionId }) => {
    const aid = String(auctionId);
    console.log(`[Socket ${socket.id}] Checked stream status for auction ${aid}. Broadcaster:`, broadcasters[aid]);
    if (broadcasters[aid]) {
      socket.emit("broadcaster-present", { broadcasterId: broadcasters[aid] });
    } else {
      socket.emit("broadcast-ended");
    }
  });
  
  // Seller starts broadcasting
  socket.on("start-broadcast", ({ auctionId }) => {
    const aid = String(auctionId);
    broadcasters[aid] = socket.id;
    socket.join(`auction:${aid}`);
    // Notify all viewers in the room that seller is live
    socket.to(`auction:${aid}`).emit("broadcaster-present", {
      broadcasterId: socket.id,
    });
    console.log(`Broadcaster started for auction ${aid}: ${socket.id}. Broadcasters obj:`, broadcasters);
  });

  // Viewer is ready to watch and needs a handshake
  socket.on("viewer-ready", ({ auctionId, viewerId }) => {
    const aid = String(auctionId);
    const broadcasterId = broadcasters[aid];
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
    const aid = String(auctionId);
    if (broadcasters[aid] === socket.id) {
      delete broadcasters[aid];
      io.to(`auction:${aid}`).emit("broadcast-ended");
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
      } else {
        // Notify the broadcaster that a viewer disconnected
        io.to(broadcasterId).emit("viewer-disconnected", { viewerId: socket.id });
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