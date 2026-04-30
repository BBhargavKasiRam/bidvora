<div align="center">
  <img src="https://img.shields.io/badge/Bidvora-Elite-gold?style=for-the-badge&logo=gavel" alt="Bidvora Logo">
  <h1>Bidvora Elite</h1>
  <p><strong>The Premier Real-Time Destination for Rare Acquisitions & Timeless Treasures</strong></p>
</div>

---

Bidvora is an exclusive, luxury-themed **real-time auction and bidding platform**. Designed with a highly polished aesthetic, it connects discerning collectors (Buyers) with premium curators (Sellers) in a fast-paced, secure, and live environment.

## 🌟 Key Platform Qualities

Bidvora goes beyond a simple CRUD application by incorporating advanced real-time networking and anti-sniping algorithms to create a truly professional auction experience.

- **🎥 WebRTC Live Showcases:** Sellers can stream live video and audio directly to bidders within the auction room using pure peer-to-peer WebRTC technology.
- **⚡ Real-Time Socket.io Bidding:** Bids are broadcasted instantaneously to all connected users in the auction room, updating the current price and bid history without requiring a page refresh.
- **🛡️ Advanced Anti-Snipe Protection:** Bids placed within the final 3 minutes automatically extend the auction timer by an additional 3 minutes. This enforces fair bidding and prevents last-second automated snipers from stealing an item.
- **☁️ Cloudinary Image Management:** Profile avatars and auction item images are securely processed using Multer and streamed directly to Cloudinary for highly optimized, CDN-backed image delivery.
- **👥 Role-Based Architecture:** Dedicated experiences for **Buyers** and **Sellers**. Sellers have access to a proprietary "My Auctions" dashboard to manage active and ended listings, while Buyers see a curated gallery of ongoing live auctions.
- **✨ Luxury Aesthetic:** Built with a fully bespoke design system featuring motion animations, glassmorphism overlays, and a sophisticated serif-based typographic hierarchy.

## 🛠️ Technology Stack

**Frontend**
- React 19 (Vite)
- Tailwind CSS v4 (Custom Luxury Theme)
- Framer Motion (Animations)
- Socket.io-client (Real-time events)
- WebRTC (Live video streaming)

**Backend**
- Node.js & Express.js
- MySQL 2 (Aiven Hosted)
- Socket.io (WebSocket Server)
- Cloudinary & Multer (Image processing)
- JWT & bcryptjs (Authentication)

---

## ⚙️ Strict Local Environment Setup

> [!WARNING]  
> **Strict Version Enforcement**
> To ensure absolute stability and compatibility with our WebRTC and Socket dependencies, this project enforces strict Node and NPM versions.
> **You MUST use:**
> - Node.js: `v20.19.4`
> - NPM: `v10.8.2`
>
> If you attempt to use different versions, the installation will deliberately fail. We recommend using `nvm` (Node Version Manager) to switch to the correct version.

### 1. Clone & Configure Versions
```bash
git clone https://github.com/Yasaswi292006/bidvora.git
cd bidvora

# Ensure you are on the required versions:
node -v  # Must output v20.19.4
npm -v   # Must output 10.8.2
```

### 2. Configure Environment Variables
You will need to configure `.env` files for both the frontend and backend.

**Backend (`backend/.env`)**
```env
# Database Configuration
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=bidvora

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (`frontend/.env`)**
*(Add any required frontend environment variables here, such as your backend API URL if deploying to production).*

### 3. Database Initialization
Before running the server, you must initialize the database schema.
1. Open your MySQL client.
2. Execute the exact SQL commands found in `backend/schema.txt` to create the `bidvora` database, `users`, `auctions`, and `bids` tables.

### 4. Install & Run Backend
```bash
cd backend
npm install
npm run start
```
*The backend should now be running on port 5000.*

### 5. Install & Run Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The luxury frontend interface is now accessible at `http://localhost:3000/`.*

---

## 👥 Contributors

- **Manoj Kumar**
- **Kasi**
- *(Add additional teammates here)*

*Developed as part of a comprehensive DBMS Mini Project.*
