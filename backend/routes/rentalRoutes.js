const express = require("express");
const router = express.Router();
const {
  createRental,
  getMyRentals,
  getOwnerRequests,
  updateRentalStatus,
} = require("../controllers/rentalController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createRental);
router.get("/mine", protect, getMyRentals);
router.get("/requests", protect, getOwnerRequests);
router.put("/:id/status", protect, updateRentalStatus);

module.exports = router;
