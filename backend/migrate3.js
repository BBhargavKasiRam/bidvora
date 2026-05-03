const db = require('./config/db');
async function migrate() {
  const query = "ALTER TABLE auctions ADD COLUMN mediator_commission DECIMAL(5,2) DEFAULT 0.00;";
  try {
    await db.promise().query(query);
    console.log('Executed:', query.substring(0, 50));
  } catch(err) {
    console.error('Error:', err.message);
  }
  process.exit();
}
migrate();
