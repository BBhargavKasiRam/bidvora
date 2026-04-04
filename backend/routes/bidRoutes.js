const express = require("express");
const router = express.Router();
const { placeBid } = require("../controllers/bidController");

router.post("/", placeBid);

module.exports = router;
