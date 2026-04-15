const express = require("express");
const router = express.Router();

const {
  register,
  login,
  checkLoginEmail,
  checkRegisterEmail,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/check-login-email", checkLoginEmail);
router.post("/check-register-email", checkRegisterEmail);

module.exports = router;