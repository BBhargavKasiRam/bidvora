const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  register,
  login,
  checkLoginEmail,
  checkRegisterEmail,
  updateProfile,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/check-login-email", checkLoginEmail);
router.post("/check-register-email", checkRegisterEmail);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;