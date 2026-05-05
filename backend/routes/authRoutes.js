const express = require("express");
const router = express.Router();

const multer = require("multer");

const authMiddleware = require("../middleware/authMiddleware");
const {
  register,
  login,
  checkLoginEmail,
  checkRegisterEmail,
  updateProfile,
  forgotPassword,
  verifyOTP,
  sendRegisterOTP,
  resetPassword,
  socialLogin
} = require("../controllers/authController");

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", register);
router.post("/send-register-otp", sendRegisterOTP);
router.post("/login", login);
router.post("/check-login-email", checkLoginEmail);
router.post("/check-register-email", checkRegisterEmail);
router.put("/profile", authMiddleware, upload.single("profile_image"), updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/social-login", socialLogin);

module.exports = router;