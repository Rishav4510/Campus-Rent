const express = require("express");
const router = express.Router();
const {
  createReview,
  getItemReviews,
  getUserReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createReview);
router.get("/item/:itemId", getItemReviews);
router.get("/user/:userId", getUserReviews);

module.exports = router;
