require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Debug DB connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("DB Connection failed:", err);
    return;
  }
  console.log("Connected to DB:", process.env.DB_NAME);
  connection.release();
});

module.exports = db;
