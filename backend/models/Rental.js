const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, default: 1 },
    rentalCost: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Active", "Completed", "Cancelled", "Overdue"],
      default: "Pending",
    },
    note: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Mock_Completed"],
      default: "Mock_Completed",
    },
  },
  { timestamps: true }
);

rentalSchema.index({ renter: 1, status: 1 });
rentalSchema.index({ owner: 1, status: 1 });
rentalSchema.index({ item: 1, status: 1 });

module.exports = mongoose.model("Rental", rentalSchema);
