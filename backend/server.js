require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
// 1. ADD THIS LINE
const bidRoutes = require("./routes/bidRoutes"); 

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
// 2. ADD THIS LINE
app.use("/api/bids", bidRoutes); 

app.listen(5000, () => {
  console.log("Server running on port 5000");
});