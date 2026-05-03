const db = require('./config/db');

db.query("SELECT id, name, role FROM users WHERE role = 'auctioneer'", (err, results) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Auctioneers:", results);
  process.exit(0);
});
