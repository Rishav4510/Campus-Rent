const express = require("express");
const router = express.Router();
const {
  getStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllItems,
  deleteAnyItem,
  getAllRentals,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/items", getAllItems);
router.delete("/items/:id", deleteAnyItem);
router.get("/rentals", getAllRentals);

module.exports = router;
