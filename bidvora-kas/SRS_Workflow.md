# Software Requirements Specification (SRS) & Workflow Documentation

## 1. Introduction
**Bidvora** is an exclusive, real-time auction marketplace designed for rare acquisitions and timeless treasures. The application facilitates seamless interactions between sellers and buyers through live bidding, WebRTC-powered live video broadcasting, and secure order management.

## 2. Technology Stack
*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Socket.IO Client.
*   **Backend:** Node.js, Express, Socket.IO (Real-time), WebRTC signaling.
*   **Database:** MySQL (managed via `mysql2`).
*   **Media Storage:** Cloudinary (for profile and auction images).

## 3. Application Workflows

### 3.1. User Authentication Workflow
**Description:** Users must register and log in to participate in auctions, create listings, or manage their profiles. Authentication is secured using JSON Web Tokens (JWT) and `bcrypt` for password hashing.
*   **Step 1:** User navigates to the Landing Page.
*   **Step 2:** User clicks on "Sign In" or "Register".
*   **Step 3:** User fills out the registration form (Name, Email, Password) or login form.
*   **Step 4:** Upon success, the system redirects the user to the Dashboard (`/`).

> **[ACTION REQUIRED - ADD SCREENSHOT HERE]**
> *Screenshot of the Login/Register Page.*

### 3.2. Dashboard & Browsing Workflow
**Description:** Once authenticated, users are greeted with the Dashboard where they can discover upcoming, live, and popular auctions.
*   **Step 1:** User views the Dashboard to see curated auction highlights.
*   **Step 2:** User can navigate to the "Browse" or "Gallery" (`/gallery`) sections to filter and search for specific items.

> **[ACTION REQUIRED - ADD SCREENSHOT HERE]**
> *Screenshot of the User Dashboard and the Browse/Gallery view.*

### 3.3. Profile Management
**Description:** Users can update their personal information and profile picture.
*   **Step 1:** User navigates to the Profile Page (`/profile`).
*   **Step 2:** User uploads a new profile image (uploaded securely to Cloudinary).
*   **Step 3:** User updates their display name or email.

> **[ACTION REQUIRED - ADD SCREENSHOT HERE]**
> *Screenshot of the Profile Page showing the image upload functionality.*

### 3.4. Seller Workflow: Creating an Auction
**Description:** Authorized users can list items for auction.
*   **Step 1:** User navigates to "Create Auction" (`/create`).
*   **Step 2:** User enters item details: Title, Description, Starting Bid, Auction End Time, etc.
*   **Step 3:** User uploads high-quality images of the item.
*   **Step 4:** The item is saved to the MySQL database and becomes visible in the marketplace.

> **[ACTION REQUIRED - ADD SCREENSHOT HERE]**
> *Screenshot of the "Create Auction" form.*

### 3.5. Buyer Workflow: Real-Time Bidding
**Description:** The core feature of Bidvora is real-time bidding using WebSockets. It includes an anti-snipe mechanism that extends the auction timer if a bid is placed in the final minutes.
*   **Step 1:** Buyer navigates to an Auction Detail Page (`/auction/:id`).
*   **Step 2:** Buyer views the current highest bid and enters a higher amount.
*   **Step 3:** The bid is emitted via Socket.IO. All connected clients in the auction room instantly see the updated highest bid.
*   **Step 4:** If the bid is placed within the final few minutes, the backend broadcasts a `timerExtended` event, adding extra time (e.g., 3 minutes) to prevent bid sniping.

> **[ACTION REQUIRED - ADD SCREENSHOT HERE]**
> *Screenshot of the Auction Detail Page highlighting the bidding interface and the real-time timer.*

### 3.6. Seller & Buyer Workflow: Live Broadcasting (WebRTC)
**Description:** Sellers can host live video streams to showcase the item while buyers bid in real-time.
*   **Step 1 (Seller):** Seller clicks "Start Broadcast" on their active auction page. The backend signals their presence to the room.
*   **Step 2 (Buyer):** Buyers in the room receive a notification that the seller is live.
*   **Step 3 (Handshake):** WebRTC offers, answers, and ICE candidates are exchanged between the seller and buyers via Socket.IO signaling.
*   **Step 4:** A peer-to-peer video connection is established, allowing buyers to watch the item live.

> **[ACTION REQUIRED - ADD SCREENSHOT HERE]**
> *Screenshot of the Live Broadcast view (showing the video player and the bidding console side-by-side).*

### 3.7. Post-Auction & Order Management
**Description:** Once an auction concludes, the highest bidder wins the item, and an order is generated.
*   **Step 1:** The auction timer hits zero. The backend marks the auction as completed.
*   **Step 2:** The winning buyer navigates to the Orders Page (`/orders`).
*   **Step 3:** The buyer reviews their won items and proceeds with checkout/payment steps.
*   **Step 4:** The seller can view their "My Auctions" (`/my-auctions`) page to see the final sale price and the winning bidder's details.

> **[ACTION REQUIRED - ADD SCREENSHOT HERE]**
> *Screenshot of the Orders Page showing a won item.*

## 4. Key Functional Requirements
1.  **Real-Time Data Sync:** Bids must reflect immediately across all connected clients without manual refreshing.
2.  **Anti-Snipe Protection:** Auctions ending within X minutes must automatically extend when a new bid is placed.
3.  **Secure Asset Delivery:** Uploaded images (profile and auction items) must be stored reliably via Cloudinary.
4.  **Low Latency Video:** The live broadcast feature must utilize WebRTC for peer-to-peer low latency streaming.

## 5. Next Steps for You (The Developer)
To finalize this document for presentation or submission, please complete the following:
1.  **Capture Screenshots:** Go through the application and capture clear screenshots for each of the sections marked with `[ACTION REQUIRED - ADD SCREENSHOT HERE]`.
2.  **Embed Screenshots:** Replace the placeholder tags with standard Markdown image links (e.g., `![Login Page](./path-to-image.png)`).
3.  **Review Text:** Adjust any specific rules (like exact anti-snipe extension minutes or payment gateway integrations if you add them later).
