const express = require("express");
const router = express.Router();
const {
  toggleFavorite,
  getMyFavorites,
  checkFavorite,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");

router.post("/toggle/:itemId", protect, toggleFavorite);
router.get("/", protect, getMyFavorites);
router.get("/check/:itemId", protect, checkFavorite);

module.exports = router;
