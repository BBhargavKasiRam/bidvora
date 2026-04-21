require("dotenv").config(); // ✅ already correct

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ADD THIS LINE (VERY IMPORTANT)
app.use("/uploads", express.static("uploads"));

const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});