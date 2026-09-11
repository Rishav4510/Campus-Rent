const Report = require("../models/Report");

// @route POST /api/reports
const createReport = async (req, res) => {
  try {
    const { item, reportedUser, reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({ message: "Reason and description are required" });
    }

    const report = await Report.create({
      reporter: req.user._id,
      item: item || undefined,
      reportedUser: reportedUser || undefined,
      reason,
      description,
      status: "Pending",
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/reports (Admin only)
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email college")
      .populate("reportedUser", "name email college")
      .populate("item", "name image pricePerDay")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/reports/:id/status (Admin only)
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Reviewed", "Resolved", "Dismissed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid report status" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = status;
    await report.save();

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReport, getAllReports, updateReportStatus };
