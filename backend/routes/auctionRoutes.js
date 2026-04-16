const express = require("express");
const router = express.Router();

const multer = require("multer"); // ✅ ADDED

const { createAuction, getAuctions, getAuctionById } = require("../controllers/auctionController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ ADDED (multer setup)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


// ✅ NEW (with image upload)
router.post("/", authMiddleware, upload.single("image"), createAuction);

router.get("/", getAuctions);
router.get("/:id", getAuctionById);

module.exports = router;