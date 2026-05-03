const db = require('./config/db');

db.query("SELECT COUNT(*) as count FROM users WHERE role = 'auctioneer'", (err, results) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Auctioneers count:", results[0].count);
  process.exit(0);
});
