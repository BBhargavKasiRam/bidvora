const db = require("./config/db");

const migrate = async () => {
  console.log("Starting Migration 6: Google Auth Support...");

  try {
    // Check if column exists
    const [columns] = await new Promise((resolve, reject) => {
        db.query("SHOW COLUMNS FROM users LIKE 'is_google_user'", (err, results) => {
            if (err) reject(err);
            else resolve([results]);
        });
    });

    if (columns.length === 0) {
      await new Promise((resolve, reject) => {
        db.query("ALTER TABLE users ADD COLUMN is_google_user BOOLEAN DEFAULT FALSE", (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("Added column is_google_user");
    } else {
      console.log("Column is_google_user already exists");
    }

    // Make password nullable
    await new Promise((resolve, reject) => {
      db.query("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Modified password column to be nullable");

    // Update roles
    await new Promise((resolve, reject) => {
      db.query("ALTER TABLE users MODIFY COLUMN role ENUM('buyer','consignor','auctioneer') NOT NULL DEFAULT 'buyer'", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Updated roles enum");

  } catch (err) {
    console.error("Migration failed:", err);
  }

  console.log("Migration 6 completed.");
  process.exit(0);
};

migrate();
