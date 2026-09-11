const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Item name is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    pricePerDay: { type: Number, required: [true, "Price per day is required"], min: 0 },
    deposit: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    image: { type: String, default: "" }, // primary image
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    available: { type: Boolean, default: true },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Worn"],
      default: "Good",
    },
    status: {
      type: String,
      enum: ["active", "rented", "inactive"],
      default: "active",
    },
    location: { type: String, default: "" },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

itemSchema.index({ name: "text", description: "text" });
itemSchema.index({ college: 1, available: 1, category: 1 });

module.exports = mongoose.model("Item", itemSchema);
