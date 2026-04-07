# 🚀 Bidvora - Real-Time Auction System

Bidvora is a **real-time auction and bidding web application** that allows users to create auctions, place bids, and compete dynamically.
The system includes an **anti-bid-sniping mechanism** to ensure fair bidding.

---

## 🎯 Project Objective

The goal of Bidvora is to build a platform where:

* Users can create and participate in live auctions
* Bidding happens in real-time
* Last-second unfair bidding (sniping) is prevented

---

## 🧠 Key Features

* 🔴 Live Auction System
* 💰 Real-time Bidding
* ⏳ Auction Timer
* 🛡️ Anti Bid-Sniping Mechanism
* 👥 Multiple Users Participation
* 📊 Dynamic Updates

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* (Add your DB here: MongoDB / MySQL)

---

## 📁 Project Structure

bidvora/
├── backend/
├── frontend/
├── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

git clone https://github.com/Yasaswi292006/bidvora.git

### 2️⃣ Navigate to project

cd bidvora

---

## ▶️ Run Backend

cd backend
npm install
node server.js

---

## ▶️ Run Frontend (New Terminal)

cd frontend
npm install
npm run dev

---

## 🌐 Access Application

Frontend runs on:
http://localhost:5173/

Backend runs on:
http://localhost:5000/ (or your configured port)

---

## 🔗 How It Works

1. User creates an auction
2. Other users join and place bids
3. Highest bid wins when timer ends
4. If bid is placed in last seconds → timer extends (anti-sniping)

---

## 👥 Team Members

* Manoj Kumar
* (Add your teammates here)

---

## 📌 Future Enhancements

* 🔔 Notifications system
* 📱 Mobile responsiveness improvements
* 🔐 Authentication (Login/Signup)
* 📈 Bid history tracking

---

## 📄 Notes

* Do not upload `node_modules`
* Use `.env` for sensitive data
* Always pull latest changes before pushing

---

## ⭐ Acknowledgement

This project is developed as part of a **DBMS Mini Project**.
