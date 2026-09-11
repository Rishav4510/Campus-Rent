const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/change-password", protect, changePassword);
router.get("/users/:id", getUserProfile);

module.exports = router;
