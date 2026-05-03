

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader); // ✅ ADD

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  console.log("TOKEN:", token); // ✅ ADD

  try {
    const SECRET = process.env.JWT_SECRET || "secret";

    console.log("SECRET (middleware):", SECRET); // ✅ ADD

    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message); // ✅ ADD
    return res.status(401).json({ message: "Invalid token" });
  }
};