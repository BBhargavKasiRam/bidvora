const express = require("express");
const router = express.Router();
const {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist
} = require("../controllers/watchlistController");

const authMiddleware = require("../middleware/authMiddleware");

// Get user's watchlist
router.get("/", authMiddleware, getWatchlist);

// Add to watchlist
router.post("/", authMiddleware, addToWatchlist);

// Remove from watchlist
router.delete("/:auction_id", authMiddleware, removeFromWatchlist);

module.exports = router;
