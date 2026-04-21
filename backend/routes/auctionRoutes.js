const express = require("express");
const router = express.Router();
const multer = require("multer");

const { 
  createAuction, 
  getAuctions, 
  getAuctionById, 
  updateAuction 
} = require("../controllers/auctionController");

const authMiddleware = require("../middleware/authMiddleware");

// ✅ Use memory storage instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getAuctions);
router.get("/:id", getAuctionById);

// ✅ Upload image to Cloudinary
router.post("/", authMiddleware, upload.single("image"), createAuction);

// ✅ Update auction with image
router.put("/:id", authMiddleware, upload.single("image"), updateAuction);

module.exports = router;