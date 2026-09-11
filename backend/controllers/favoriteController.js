const Favorite = require("../models/Favorite");
const Item = require("../models/Item");

// @route POST /api/favorites/toggle/:itemId
const toggleFavorite = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const existing = await Favorite.findOne({ user: req.user._id, item: itemId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ isFavorite: false, message: "Item removed from favorites" });
    }

    await Favorite.create({ user: req.user._id, item: itemId });
    res.status(201).json({ isFavorite: true, message: "Item added to favorites" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/favorites
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: "item",
        populate: [
          { path: "owner", select: "name email hostel rating profileImage" },
          { path: "college", select: "name city" },
        ],
      })
      .sort({ createdAt: -1 });

    const items = favorites.map((f) => f.item).filter(Boolean);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/favorites/check/:itemId
const checkFavorite = async (req, res) => {
  try {
    const existing = await Favorite.findOne({ user: req.user._id, item: req.params.itemId });
    res.json({ isFavorite: !!existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { toggleFavorite, getMyFavorites, checkFavorite };
