const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "292006",
  database: "bidvora"
});

db.connect(err => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("DB Connected");
});

module.exports = db;
