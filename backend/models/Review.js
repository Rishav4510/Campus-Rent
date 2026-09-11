const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rental: { type: mongoose.Schema.Types.ObjectId, ref: "Rental", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ rental: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ item: 1 });
reviewSchema.index({ reviewedUser: 1 });

module.exports = mongoose.model("Review", reviewSchema);
