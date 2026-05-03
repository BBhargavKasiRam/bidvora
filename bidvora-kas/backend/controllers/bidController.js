const db = require("../config/db");

// We'll attach io to this module from server.js
let io;
exports.setIo = (socketIo) => { io = socketIo; };

exports.placeBid = (req, res) => {
  const { auction_id, amount } = req.body;

  db.query(
    `SELECT a.*, u.name AS seller_name FROM auctions a 
     JOIN users u ON a.seller_id = u.id 
     WHERE a.id = ?`,
    [auction_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (result.length === 0) return res.status(404).json({ message: "Auction not found" });

      const auction = result[0];

      // Check auction hasn't ended
      if (new Date(auction.end_time) <= new Date()) {
        return res.status(400).json({ message: "Auction has ended" });
      }

      if (Number(amount) <= Number(auction.current_price)) {
        return res.status(400).json({
          message: `Bid must be higher than $${Number(auction.current_price).toLocaleString()}`,
        });
      }

      // Update current price
      db.query(
        "UPDATE auctions SET current_price = ? WHERE id = ?",
        [amount, auction_id],
        (err) => {
          if (err) return res.status(500).json({ message: "Failed to update price" });
        }
      );

      // ─── ANTI-SNIPING LOGIC ────────────────────────────────────────────
      // If bid placed within last 3 minutes, extend by 3 minutes
      const SNIPE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes
      const EXTENSION_MS = 3 * 60 * 1000;       // extend by 3 minutes

      const now = new Date();
      const endTime = new Date(auction.end_time);
      const remaining = endTime - now;

      let newEndTime = null;
      let wasExtended = false;

      if (remaining > 0 && remaining < SNIPE_THRESHOLD_MS) {
        newEndTime = new Date(endTime.getTime() + EXTENSION_MS);
        wasExtended = true;

        db.query(
          "UPDATE auctions SET end_time = ? WHERE id = ?",
          [newEndTime, auction_id],
          (err) => {
            if (err) console.error("Failed to extend timer:", err);
          }
        );
      }

      // Insert bid
      db.query(
        `INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)`,
        [auction_id, req.user.id, amount],
        (err, insertResult) => {
          if (err) return res.status(500).json({ message: "Failed to record bid" });

          // Fetch bidder name for broadcast
          db.query(
            "SELECT name FROM users WHERE id = ?",
            [req.user.id],
            (err, userResult) => {
              const userName = userResult?.[0]?.name || "Anonymous";

              const bidData = {
                id: insertResult.insertId,
                auction_id,
                user_id: req.user.id,
                user_name: userName,
                amount: Number(amount),
                created_at: new Date().toISOString(),
                wasExtended,
                newEndTime: newEndTime ? newEndTime.toISOString() : null,
              };

              // Broadcast to all sockets in auction room
              if (io) {
                io.to(`auction:${auction_id}`).emit("newBid", bidData);
                if (wasExtended) {
                  io.to(`auction:${auction_id}`).emit("timerExtended", {
                    newEndTime: newEndTime.toISOString(),
                    extensionMinutes: 3,
                  });
                }
              }

              res.json({
                message: wasExtended
                  ? "Bid placed! Timer extended by 3 minutes (anti-snipe protection)"
                  : "Bid placed successfully!",
                bid: bidData,
                wasExtended,
                newEndTime: newEndTime ? newEndTime.toISOString() : null,
              });
            }
          );
        }
      );
    }
  );
};