const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const { body } = require("express-validator");


// Register
router.post("/register", [
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], validate, register);

// Login
router.post("/login", [
  body("email").isEmail().withMessage("A valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
], validate, login);

// Logout
router.post("/logout", logout);

// Current logged-in user
router.get("/me", protect, getMe);


module.exports = router;