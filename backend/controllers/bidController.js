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

      // Prevent seller from bidding on their own item
      if (auction.seller_id === req.user.id) {
        return res.status(403).json({ message: "You cannot place a bid on your own auction." });
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
                const roomName = `auction:${String(auction_id)}`;
                console.log(`[BidController] Emitting newBid to ${roomName}`);
                io.to(roomName).emit("newBid", bidData);
                
                // Manual bid announcements will be handled by the frontend emit for better reliability
                // But we still insert to DB for history
                const chatMsg = `A new bid of $${Number(amount).toLocaleString()} has been placed by ${userName}!`;
                db.query(
                  "INSERT INTO chat_messages (auction_id, user_id, message, is_system_message) VALUES (?, NULL, ?, 1)",
                  [auction_id, chatMsg],
                  (chatErr) => {
                    if (chatErr) console.error("Error inserting bid chat message:", chatErr);
                  }
                );

                if (wasExtended) {
                  io.to(roomName).emit("timerExtended", {
                    newEndTime: newEndTime.toISOString(),
                    extensionMinutes: 3,
                  });
                }
              } else {
                console.error("[BidController] IO instance not set! Cannot broadcast bid.");
              }

              res.json({
                message: wasExtended
                  ? "Bid placed! Timer extended by 3 minutes (anti-snipe protection)"
                  : "Bid placed successfully!",
                bid: bidData,
                wasExtended,
                newEndTime: newEndTime ? newEndTime.toISOString() : null,
              });

              // ─── AUTO-BID (PROXY BID) LOGIC ──────────────────────────────
              // Check if another user has a proxy bid > amount
              db.query(
                `SELECT * FROM proxy_bids WHERE auction_id = ? AND user_id != ? AND max_bid_amount > ? ORDER BY max_bid_amount DESC LIMIT 1`,
                [auction_id, req.user.id, amount],
                (err, proxyResults) => {
                  if (err || proxyResults.length === 0) return;

                  const proxyBid = proxyResults[0];
                  const increment = 10; // Auto-bid increment
                  let autoBidAmount = Number(amount) + increment;
                  
                  if (autoBidAmount > proxyBid.max_bid_amount) {
                     autoBidAmount = proxyBid.max_bid_amount;
                  }

                  // Update current price
                  db.query(
                    "UPDATE auctions SET current_price = ? WHERE id = ?",
                    [autoBidAmount, auction_id],
                    (err) => {
                      if (err) return;
                      
                      // Insert the auto bid
                      db.query(
                        `INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)`,
                        [auction_id, proxyBid.user_id, autoBidAmount],
                        (err, autoInsertResult) => {
                          if (err) return;

                          db.query(
                            "SELECT name FROM users WHERE id = ?",
                            [proxyBid.user_id],
                            (err, autoUserResult) => {
                              const autoUserName = autoUserResult?.[0]?.name || "Auto Bidder";
                              const autoBidData = {
                                id: autoInsertResult.insertId,
                                auction_id,
                                user_id: proxyBid.user_id,
                                user_name: autoUserName,
                                amount: Number(autoBidAmount),
                                created_at: new Date().toISOString(),
                                isAutoBid: true
                              };

                               if (io) {
                                 const roomName = `auction:${String(auction_id)}`;
                                 io.to(roomName).emit("newBid", autoBidData);

                                 // Also broadcast auto-bid to chat
                                 const autoChatMsg = `Auto-bid of $${Number(autoBidAmount).toLocaleString()} placed for ${autoUserName}`;
                                 db.query(
                                   "INSERT INTO chat_messages (auction_id, user_id, message, is_system_message) VALUES (?, NULL, ?, 1)",
                                   [auction_id, autoChatMsg],
                                   (chatErr, chatResult) => {
                                     if (!chatErr) {
                                       io.to(roomName).emit("newChatMessage", {
                                         id: chatResult.insertId,
                                         auction_id: String(auction_id),
                                         user_id: null,
                                         user_name: "System",
                                         message: autoChatMsg,
                                         is_system_message: 1,
                                         created_at: new Date().toISOString()
                                       });
                                     }
                                   }
                                 );
                               }
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

exports.setProxyBid = (req, res) => {
  const { auction_id, max_bid_amount } = req.body;
  const user_id = req.user.id;

  if (!auction_id || !max_bid_amount) {
    return res.status(400).json({ message: "Auction ID and max bid amount are required" });
  }

  db.query(
    `SELECT a.* FROM auctions a WHERE a.id = ?`,
    [auction_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (result.length === 0) return res.status(404).json({ message: "Auction not found" });

      const auction = result[0];

      if (new Date(auction.end_time) <= new Date()) {
        return res.status(400).json({ message: "Auction has ended" });
      }

      if (auction.seller_id === user_id) {
        return res.status(403).json({ message: "You cannot place a proxy bid on your own auction." });
      }

      if (Number(max_bid_amount) <= Number(auction.current_price)) {
        return res.status(400).json({
          message: `Max bid must be higher than current price $${Number(auction.current_price).toLocaleString()}`,
        });
      }

      // Check if user already has a proxy bid
      db.query(
        "SELECT id FROM proxy_bids WHERE auction_id = ? AND user_id = ?",
        [auction_id, user_id],
        (err, existingResults) => {
          if (err) return res.status(500).json({ message: "Server error" });

          if (existingResults.length > 0) {
            // Update
            db.query(
              "UPDATE proxy_bids SET max_bid_amount = ? WHERE id = ?",
              [max_bid_amount, existingResults[0].id],
              (err) => {
                if (err) return res.status(500).json({ message: "Failed to update proxy bid" });
                res.json({ message: "Proxy bid updated successfully!" });
              }
            );
          } else {
            // Insert
            db.query(
              "INSERT INTO proxy_bids (auction_id, user_id, max_bid_amount) VALUES (?, ?, ?)",
              [auction_id, user_id, max_bid_amount],
              (err) => {
                if (err) return res.status(500).json({ message: "Failed to set proxy bid" });
                res.json({ message: "Proxy bid set successfully! We will automatically bid for you." });
              }
            );
          }
        }
      );
    }
  );
};

exports.getProxyBid = (req, res) => {
  const { auctionId } = req.params;
  const userId = req.user.id;

  db.query(
    "SELECT max_bid_amount FROM proxy_bids WHERE auction_id = ? AND user_id = ?",
    [auctionId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length > 0) {
        res.json({ max_bid_amount: results[0].max_bid_amount });
      } else {
        res.json({ max_bid_amount: null });
      }
    }
  );
};

exports.removeProxyBid = (req, res) => {
  const { auctionId } = req.params;
  const userId = req.user.id;

  db.query(
    "DELETE FROM proxy_bids WHERE auction_id = ? AND user_id = ?",
    [auctionId, userId],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Proxy bid removed successfully" });
    }
  );
};