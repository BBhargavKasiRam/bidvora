const db = require("./config/db");
db.query("DESCRIBE users;", (err, results) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Schema:", results);
  }
  process.exit();
});
