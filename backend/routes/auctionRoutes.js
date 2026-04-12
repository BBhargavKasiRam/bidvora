const express = require("express");
const router = express.Router();
const { createAuction, getAuctions, getAuctionById } = require("../controllers/auctionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createAuction);
router.get("/", getAuctions);
router.get("/:id", getAuctionById);

module.exports = router;
