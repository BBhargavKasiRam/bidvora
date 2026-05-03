const db = require('./config/db');

async function migrate() {
  const queries = [
    // 1. Temporarily allow any string to avoid ENUM constraint during update
    "ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL;",
    
    // 2. Update the values
    "UPDATE users SET role = 'consignor' WHERE role = 'seller';",
    "UPDATE users SET role = 'auctioneer' WHERE role = 'mediator';",
    
    // 3. Set the new ENUM values
    "ALTER TABLE users MODIFY COLUMN role ENUM('buyer', 'consignor', 'auctioneer') NOT NULL;",
    
    // 4. Update auctions table mediator_status enum just in case
    "ALTER TABLE auctions MODIFY COLUMN mediator_status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending';"
  ];

  for (let query of queries) {
    try {
      console.log('Executing:', query);
      await db.promise().query(query);
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
  
  console.log('Migration to Consignor/Auctioneer terminology complete.');
  process.exit();
}

migrate();
