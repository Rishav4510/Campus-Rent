const express = require("express");
const router = express.Router();
const {
  getCities,
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  toggleCollegeStatus,
} = require("../controllers/stateCollegeController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/cities", getCities);
router.get("/", getColleges);
router.get("/:id", getCollegeById);
router.post("/", protect, adminOnly, createCollege);
router.put("/:id", protect, adminOnly, updateCollege);
router.patch("/:id/status", protect, adminOnly, toggleCollegeStatus);

module.exports = router;
