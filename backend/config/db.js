require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },

  connectTimeout: 20000,   // increase timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// ✅ Better test
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB Connection failed FULL:", err);
    return;
  }
  console.log("✅ Connected to Aiven MySQL");
  connection.release();
});

module.exports = db;