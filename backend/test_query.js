const mysql = require("mysql2");
require("dotenv").config({ path: "./backend/.env" });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

const sql = `
    SELECT 
      a.id,
      a.title,
      a.description,
      a.image,
      a.current_price AS price,
      a.end_time,
      a.starting_price,
      u.name AS seller_name,
      b.created_at AS won_at
    FROM auctions a
    JOIN users u ON a.seller_id = u.id
    JOIN bids b ON b.auction_id = a.id AND b.user_id = ? AND b.amount = a.current_price
    WHERE a.end_time <= NOW()
    ORDER BY b.created_at DESC
`;

db.query(sql, [1], (err, results) => {
  if (err) {
    console.error("SQL ERROR:", err);
  } else {
    console.log("RESULTS:", results);
  }
  db.end();
});
