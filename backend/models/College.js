const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
    city: { type: String, required: true, trim: true },
    type: { type: String, default: "University" },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },
    code: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

collegeSchema.index({ state: 1, city: 1, name: 1 });
collegeSchema.index({ state: 1, name: 1 });
collegeSchema.index({ name: "text", city: "text", code: "text" });

module.exports = mongoose.model("College", collegeSchema);
