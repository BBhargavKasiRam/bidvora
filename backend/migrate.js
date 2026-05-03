const db = require('./config/db');

const migrate = async () => {
  const queries = [
    `ALTER TABLE users MODIFY COLUMN role ENUM('buyer','seller','mediator') NOT NULL`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      auction_id INT NOT NULL,
      user_id INT,
      message TEXT NOT NULL,
      is_system_message BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS mediator_actions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      auction_id INT NOT NULL,
      mediator_id INT NOT NULL,
      action_type ENUM('flag_auction', 'mute_user', 'resolve_dispute', 'delete_message', 'system_warning') NOT NULL,
      target_user_id INT,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      FOREIGN KEY (mediator_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS muted_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      auction_id INT NOT NULL,
      user_id INT NOT NULL,
      muted_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (muted_by) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (let i = 0; i < queries.length; i++) {
    try {
      console.log(`Executing query ${i + 1}...`);
      await new Promise((resolve, reject) => {
        db.query(queries[i], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      console.log(`Query ${i + 1} successful.`);
    } catch (error) {
      console.error(`Error executing query ${i + 1}:`, error);
      // Don't stop if column already modified or table exists, but good to log
    }
  }

  console.log("Migration complete.");
  process.exit(0);
};

migrate();
