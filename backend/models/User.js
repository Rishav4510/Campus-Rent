const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
    city: { type: String, default: "", trim: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    course: { type: String, default: "" },
    year: { type: String, default: "1st Year" },
    profileImage: { type: String, default: "" },
    phone: { type: String, default: "" },
    hostel: { type: String, default: "" },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    ratingCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
