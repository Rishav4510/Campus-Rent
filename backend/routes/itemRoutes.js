const express = require("express");
const router = express.Router();
const {
  getItems,
  getItemById,
  getMyItems,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getItems);
router.get("/mine/list", protect, getMyItems);
router.get("/:id", getItemById);
router.post("/", protect, upload.array("images", 5), createItem);
router.put("/:id", protect, upload.array("images", 5), updateItem);
router.delete("/:id", protect, deleteItem);

module.exports = router;
