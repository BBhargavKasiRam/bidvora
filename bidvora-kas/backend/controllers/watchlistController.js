const db = require("../config/db");

// Get Watchlist
exports.getWatchlist = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      w.id as watchlist_id,
      a.*,
      u.name as seller_name
    FROM watchlist w
    JOIN auctions a ON w.auction_id = a.id
    JOIN users u ON a.seller_id = u.id
    WHERE w.user_id = ?
    ORDER BY w.id DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching watchlist:", err);
      return res.status(500).json({ message: "Error fetching watchlist" });
    }
    res.json(results);
  });
};

// Add to Watchlist
exports.addToWatchlist = (req, res) => {
  const userId = req.user.id;
  const { auction_id } = req.body;

  if (!auction_id) {
    return res.status(400).json({ message: "Auction ID is required" });
  }

  // Check if already in watchlist
  const checkSql = "SELECT * FROM watchlist WHERE user_id = ? AND auction_id = ?";
  db.query(checkSql, [userId, auction_id], (err, results) => {
    if (err) {
      console.error("Error checking watchlist:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Item is already in your watchlist" });
    }

    const insertSql = "INSERT INTO watchlist (user_id, auction_id) VALUES (?, ?)";
    db.query(insertSql, [userId, auction_id], (err, result) => {
      if (err) {
        console.error("Error adding to watchlist:", err);
        return res.status(500).json({ message: "Error adding to watchlist" });
      }
      res.status(201).json({ message: "Added to watchlist successfully" });
    });
  });
};

// Remove from Watchlist
exports.removeFromWatchlist = (req, res) => {
  const userId = req.user.id;
  const auctionId = req.params.auction_id;

  const sql = "DELETE FROM watchlist WHERE user_id = ? AND auction_id = ?";
  db.query(sql, [userId, auctionId], (err, result) => {
    if (err) {
      console.error("Error removing from watchlist:", err);
      return res.status(500).json({ message: "Error removing from watchlist" });
    }
    res.json({ message: "Removed from watchlist successfully" });
  });
};
