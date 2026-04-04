const express = require("express");
const router = express.Router();
const { createAuction, getAuctions } = require("../controllers/auctionController");

router.post("/", createAuction);
router.get("/", getAuctions);

module.exports = router;
