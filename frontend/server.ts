import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("bidvora.db");

/**
 * NOTE: To use MySQL (as requested), you would replace the SQLite 'db' above with:
 * 
 * const mysql = require("mysql2");
 * const db = mysql.createConnection({
 *   host: "localhost",
 *   user: "root",
 *   password: process.env.DB_PASSWORD,
 *   database: "bidvora"
 * });
 * 
 * In this environment, we use SQLite for immediate functionality.
 */

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS auctions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    starting_price REAL NOT NULL,
    current_price REAL NOT NULL,
    end_time DATETIME NOT NULL,
    FOREIGN KEY (seller_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auction_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const JWT_SECRET = process.env.JWT_SECRET || "secret";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
      stmt.run(name, email, hashed, role);
      res.json({ message: "User registered" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  });

  // Auction Routes
  app.post("/api/auctions", authenticate, (req: any, res) => {
    const { title, description, starting_price, duration } = req.body;
    const end_time = new Date(Date.now() + duration * 1000).toISOString();
    try {
      const stmt = db.prepare(
        "INSERT INTO auctions (seller_id, title, description, starting_price, current_price, end_time) VALUES (?, ?, ?, ?, ?, ?)"
      );
      stmt.run(req.user.id, title, description, starting_price, starting_price, end_time);
      res.json({ message: "Auction created successfully" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/auctions", (req, res) => {
    const auctions = db.prepare(`
      SELECT a.*, u.name as seller_name 
      FROM auctions a 
      JOIN users u ON a.seller_id = u.id
      ORDER BY a.end_time DESC
    `).all();
    res.json(auctions);
  });

  app.get("/api/auctions/:id", (req, res) => {
    const auction = db.prepare(`
      SELECT a.*, u.name as seller_name 
      FROM auctions a 
      JOIN users u ON a.seller_id = u.id
      WHERE a.id = ?
    `).get(req.params.id) as any;
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    
    const bids = db.prepare(`
      SELECT b.*, u.name as user_name 
      FROM bids b 
      JOIN users u ON b.user_id = u.id 
      WHERE b.auction_id = ? 
      ORDER BY b.amount DESC
    `).all(req.params.id);
    
    res.json({ ...auction, bids });
  });

  // Bid Routes
  app.post("/api/bids", authenticate, (req: any, res) => {
    const { auction_id, amount } = req.body;
    const auction: any = db.prepare("SELECT * FROM auctions WHERE id = ?").get(auction_id);

    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (amount <= auction.current_price) return res.status(400).json({ error: "Bid too low" });

    const now = new Date();
    const endTime = new Date(auction.end_time);
    if (now > endTime) return res.status(400).json({ error: "Auction ended" });

    // Update price
    db.prepare("UPDATE auctions SET current_price = ? WHERE id = ?").run(amount, auction_id);

    // Anti-sniping
    const remaining = endTime.getTime() - now.getTime();
    if (remaining < 30000) {
      const newTime = new Date(endTime.getTime() + 60000).toISOString();
      db.prepare("UPDATE auctions SET end_time = ? WHERE id = ?").run(newTime, auction_id);
    }

    // Insert bid
    db.prepare("INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)").run(
      auction_id,
      req.user.id,
      amount
    );

    res.json({ message: "Bid placed successfully" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
