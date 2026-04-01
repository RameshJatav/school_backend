// routes/studentAuthRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("./studentAuthController");
const authAdmin = require("../middleware/authAdmin");

// ADMIN
router.post("/register", authAdmin, controller.registerRequest);

// STUDENT
router.post("/login", controller.login);
router.post("/login-verify", controller.verifyLoginOtp);
router.post("/resend-otp", controller.resendOtp);

module.exports = router;
