const db = require('./config/db');
async function migrate() {
  const queries = [
    "ALTER TABLE auctions ADD COLUMN mediator_status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending';",
    `CREATE TABLE IF NOT EXISTS mediator_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      auction_id INT NOT NULL,
      sender_id INT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );`
  ];
  for (let query of queries) {
    try {
      await db.promise().query(query);
      console.log('Executed:', query.substring(0, 50));
    } catch(err) {
      console.error('Error:', err.message);
    }
  }
  process.exit();
}
migrate();
