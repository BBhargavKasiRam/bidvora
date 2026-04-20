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

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/", getAuctions);
router.get("/:id", getAuctionById);
router.post("/", authMiddleware, upload.single("image"), createAuction);

// ✅ Handles the Update (PUT) request
router.put("/:id", authMiddleware, upload.single("image"), updateAuction);

module.exports = router;