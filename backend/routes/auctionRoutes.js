const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
} = require("../controllers/auctionController");

const authMiddleware = require("../middleware/authMiddleware");

// ✅ Memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get("/", getAuctions);
router.get("/:id", getAuctionById);

// ✅ Create (with image REQUIRED)
router.post("/", authMiddleware, upload.single("image"), createAuction);

// ✅ Update (image optional here)
router.put("/:id", authMiddleware, upload.single("image"), updateAuction);

module.exports = router;