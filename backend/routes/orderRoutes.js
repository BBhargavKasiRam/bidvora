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
      b.created_at AS won_at
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    JOIN bids b ON b.auction_id = a.id AND b.user_id = ? AND b.amount = a.current_price
    WHERE a.end_time <= NOW()
    ORDER BY b.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Orders fetch error:", err);
      return res.status(500).json({ message: "Error fetching orders" });
    }
    res.json(results);
  });
});

module.exports = router;