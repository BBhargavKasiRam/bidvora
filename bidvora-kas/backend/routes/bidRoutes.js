const express = require("express");
const router = express.Router();
const { placeBid } = require("../controllers/bidController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, placeBid);

module.exports = router;
