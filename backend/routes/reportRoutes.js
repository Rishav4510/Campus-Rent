const express = require("express");
const router = express.Router();
const {
  createReport,
  getAllReports,
  updateReportStatus,
} = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, createReport);
router.get("/", protect, adminOnly, getAllReports);
router.patch("/:id/status", protect, adminOnly, updateReportStatus);

module.exports = router;
