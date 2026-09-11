const User = require("../models/User");
const Item = require("../models/Item");
const Rental = require("../models/Rental");
const College = require("../models/College");
const Report = require("../models/Report");

// =====================================================
// GET /api/admin/stats
// =====================================================

const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalColleges,
      totalItems,
      activeRentals,
      completedRentals,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      College.countDocuments({ active: true }),
      Item.countDocuments({ status: "active" }),
      Rental.countDocuments({
        status: { $in: ["Accepted", "Active"] },
      }),
      Rental.countDocuments({ status: "Completed" }),
      Report.countDocuments({ status: "Pending" }),
    ]);

    res.json({
      totalUsers,
      totalColleges,
      totalItems,
      activeRentals,
      completedRentals,
      pendingReports,
    });
  } catch (err) {
    console.error("Admin stats error:", err);

    res.status(500).json({
      message: err.message || "Failed to fetch admin statistics",
    });
  }
};

// =====================================================
// GET /api/admin/users
// =====================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("college", "name city")
      .populate("state", "name code")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);

    res.status(500).json({
      message: err.message || "Failed to fetch users",
    });
  }
};

// =====================================================
// PATCH /api/admin/users/:id/status
// =====================================================

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Don't deactivate admin accounts
    if (user.role === "admin") {
      return res.status(400).json({
        message: "Admin account status cannot be changed",
      });
    }

    user.active = !user.active;

    await user.save();

    res.json({
      message: `User ${
        user.active ? "activated" : "deactivated"
      } successfully`,
      user,
    });
  } catch (err) {
    console.error("Toggle user status error:", err);

    res.status(500).json({
      message: err.message || "Failed to update user status",
    });
  }
};

// =====================================================
// DELETE /api/admin/users/:id
// =====================================================

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent admin deletion
    if (user.role === "admin") {
      return res.status(400).json({
        message: "Cannot delete an admin account",
      });
    }

    await user.deleteOne();

    res.json({
      message: "User removed successfully",
    });
  } catch (err) {
    console.error("Delete user error:", err);

    res.status(500).json({
      message: err.message || "Failed to delete user",
    });
  }
};

// =====================================================
// GET /api/admin/items
// =====================================================

const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("owner", "name email phone")
      .populate("college", "name city")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("Get items error:", err);

    res.status(500).json({
      message: err.message || "Failed to fetch items",
    });
  }
};

// =====================================================
// DELETE /api/admin/items/:id
// =====================================================

const deleteAnyItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Item removed by admin",
    });
  } catch (err) {
    console.error("Delete item error:", err);

    res.status(500).json({
      message: err.message || "Failed to delete item",
    });
  }
};

// =====================================================
// GET /api/admin/rentals
// =====================================================

const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate("item", "name pricePerDay")
      .populate("owner", "name email phone")
      .populate("renter", "name email phone")
      .populate("college", "name")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (err) {
    console.error("Get rentals error:", err);

    res.status(500).json({
      message: err.message || "Failed to fetch rentals",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllItems,
  deleteAnyItem,
  getAllRentals,
};
