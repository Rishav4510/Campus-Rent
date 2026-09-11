const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, item: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
