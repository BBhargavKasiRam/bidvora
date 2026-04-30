const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../config/db");

// GET /api/orders - fetch auctions won by current user
router.get("/", authMiddleware, (req, res) => {
  const userId = req.user.id;

  // A user "wins" an auction if:
  // 1. The auction has ended (end_time <= NOW)
  // 2. They placed the highest bid (their bid is the current_price)
  const sql = `
    SELECT 
      a.id,
      a.title,
      a.description,
      a.image,
      a.current_price AS price,
      a.end_time,
      a.starting_price,
      u.name AS seller_name,
      b.created_at AS won_at,
      t.id AS transaction_id
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    JOIN bids b ON b.auction_id = a.id
    LEFT JOIN transactions t ON t.auction_id = a.id AND t.winner_id = b.user_id
    WHERE b.user_id = ? 
      AND b.amount = a.current_price
      AND a.end_time <= CURRENT_TIMESTAMP
    ORDER BY b.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Orders fetch error:", err);
      return res.status(500).json({ 
        message: "Error fetching orders",
        error: err.message // Send error message for debugging
      });
    }
    res.json(results);
  });
});

// POST /api/orders/checkout - finalize payment and save transaction
router.post("/checkout", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { auction_id, final_price } = req.body;

  if (!auction_id || !final_price) {
    return res.status(400).json({ message: "Missing auction_id or final_price" });
  }

  // Check if transaction already exists
  db.query("SELECT * FROM transactions WHERE auction_id = ?", [auction_id], (err, results) => {
    if (err) {
      console.error("Error checking transaction:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    const insertSql = "INSERT INTO transactions (auction_id, winner_id, final_price) VALUES (?, ?, ?)";
    db.query(insertSql, [auction_id, userId, final_price], (err, result) => {
      if (err) {
        console.error("Error creating transaction:", err);
        return res.status(500).json({ message: "Payment failed" });
      }
      res.json({ message: "Payment successful!" });
    });
  });
});

module.exports = router;