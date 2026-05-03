const db = require('./config/db');
async function migrate() {
  const query1 = "ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255) DEFAULT NULL;";
  const query2 = "ALTER TABLE users ADD COLUMN password_reset_expires DATETIME DEFAULT NULL;";
  try {
    await db.promise().query(query1);
    console.log('Executed:', query1);
  } catch(err) {
    console.error('Error 1:', err.message);
  }
  try {
    await db.promise().query(query2);
    console.log('Executed:', query2);
  } catch(err) {
    console.error('Error 2:', err.message);
  }
  process.exit();
}
migrate();
