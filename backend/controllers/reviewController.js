const db = require("../config/db");

exports.addReview = (req, res) => {
  const { auction_id, reviewee_id, rating, comment } = req.body;
  const reviewer_id = req.user.id;

  if (!auction_id || !reviewee_id || !rating) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Ensure rating is between 1 and 5
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  // Only allow buyer to review seller after auction ends and transaction exists
  db.query(
    "SELECT id FROM transactions WHERE auction_id = ?",
    [auction_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0) {
        return res.status(400).json({ message: "You can only review after a transaction is created." });
      }

      // Ensure user hasn't already reviewed this auction
      db.query(
        "SELECT id FROM reviews WHERE auction_id = ? AND reviewer_id = ?",
        [auction_id, reviewer_id],
        (err, existingReviews) => {
          if (err) return res.status(500).json({ message: "Server error" });
          if (existingReviews.length > 0) {
            return res.status(400).json({ message: "You have already reviewed this transaction." });
          }

          db.query(
            "INSERT INTO reviews (auction_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
            [auction_id, reviewer_id, reviewee_id, rating, comment || null],
            (err) => {
              if (err) return res.status(500).json({ message: "Failed to submit review" });
              res.status(201).json({ message: "Review submitted successfully" });
            }
          );
        }
      );
    }
  );
};

exports.getReviewsForUser = (req, res) => {
  const { userId } = req.params;

  db.query(
    `SELECT 
      r.id, r.rating, r.comment, r.created_at,
      u.name AS reviewer_name
     FROM reviews r
     JOIN users u ON r.reviewer_id = u.id
     WHERE r.reviewee_id = ?
     ORDER BY r.created_at DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      const totalReviews = results.length;
      const averageRating = totalReviews > 0 
        ? (results.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
        : 0;

      res.json({
        totalReviews,
        averageRating: Number(averageRating),
        reviews: results
      });
    }
  );
};
