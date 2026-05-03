const db = require("../config/db");

exports.setProxyBid = (req, res) => {
  const { auction_id, max_bid_amount } = req.body;
  const user_id = req.user.id;

  if (!auction_id || !max_bid_amount) {
    return res.status(400).json({ message: "Auction ID and max bid amount are required" });
  }

  // Check if it's their own auction
  db.query(
    "SELECT seller_id FROM auctions WHERE id = ?",
    [auction_id],
    (err, results) => {
      if (err || results.length === 0) return res.status(500).json({ message: "Server error" });
      if (results[0].seller_id === user_id) {
        return res.status(403).json({ message: "You cannot place a proxy bid on your own auction." });
      }

      // Check if proxy bid already exists
      db.query(
        "SELECT id FROM proxy_bids WHERE auction_id = ? AND user_id = ?",
        [auction_id, user_id],
        (err, proxyResults) => {
          if (err) return res.status(500).json({ message: "Server error" });

          if (proxyResults.length > 0) {
            // Update
            db.query(
              "UPDATE proxy_bids SET max_bid_amount = ? WHERE auction_id = ? AND user_id = ?",
              [max_bid_amount, auction_id, user_id],
              (err) => {
                if (err) return res.status(500).json({ message: "Server error" });
                res.json({ message: "Proxy bid updated" });
              }
            );
          } else {
            // Insert
            db.query(
              "INSERT INTO proxy_bids (auction_id, user_id, max_bid_amount) VALUES (?, ?, ?)",
              [auction_id, user_id, max_bid_amount],
              (err) => {
                if (err) return res.status(500).json({ message: "Server error" });
                res.json({ message: "Proxy bid set" });
              }
            );
          }
        }
      );
    }
  );
};

exports.getProxyBid = (req, res) => {
  const { auction_id } = req.params;
  const user_id = req.user.id;

  db.query(
    "SELECT max_bid_amount FROM proxy_bids WHERE auction_id = ? AND user_id = ?",
    [auction_id, user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0) return res.json({ max_bid_amount: null });
      res.json({ max_bid_amount: results[0].max_bid_amount });
    }
  );
};

exports.removeProxyBid = (req, res) => {
  const { auction_id } = req.params;
  const user_id = req.user.id;

  db.query(
    "DELETE FROM proxy_bids WHERE auction_id = ? AND user_id = ?",
    [auction_id, user_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Proxy bid removed" });
    }
  );
};
