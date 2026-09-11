const User = require("../models/User");
const Item = require("../models/Item");
const Rental = require("../models/Rental");
const Review = require("../models/Review");
const generateToken = require("../utils/generateToken");

// =====================================================
// POST /api/auth/register
// =====================================================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      state,
      city,
      college,
      course,
      year,
      phone,
      hostel,
    } = req.body;

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    // Public registration always creates student account
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "student",
      state: state || undefined,
      city: city ? city.trim() : "",
      college: college || undefined,
      course: course || "",
      year: year || "1st Year",
      phone: phone || "",
      hostel: hostel || "",
    });

    // Populate state and college
    const populatedUser = await User.findById(user._id)
      .populate("state", "name code")
      .populate("college", "name city type website");

    res.status(201).json({
      _id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      state: populatedUser.state,
      city: populatedUser.city,
      college: populatedUser.college,
      course: populatedUser.course,
      year: populatedUser.year,
      phone: populatedUser.phone,
      hostel: populatedUser.hostel,
      profileImage: populatedUser.profileImage,
      rating: populatedUser.rating,
      ratingCount: populatedUser.ratingCount,
      token: generateToken(populatedUser._id, populatedUser.role),
    });
  } catch (err) {
    console.error("Register error:", err);

    res.status(500).json({
      message: err.message || "Registration failed",
    });
  }
};

// =====================================================
// POST /api/auth/login
// =====================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    })
      .select("+password")
      .populate("state", "name code")
      .populate("college", "name city type website");

    // Invalid credentials
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Account status
    if (user.active === false) {
      return res.status(403).json({
        message:
          "Account has been suspended. Please contact support.",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      state: user.state,
      city: user.city,
      college: user.college,
      course: user.course,
      year: user.year,
      phone: user.phone,
      hostel: user.hostel,
      profileImage: user.profileImage,
      rating: user.rating,
      ratingCount: user.ratingCount,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      message: err.message || "Login failed",
    });
  }
};

// =====================================================
// GET /api/auth/me
// =====================================================

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("state", "name code")
      .populate("college", "name city type website");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Get current user error:", err);

    res.status(500).json({
      message: err.message || "Failed to fetch user",
    });
  }
};

// =====================================================
// PUT /api/auth/me
// =====================================================

const updateMe = async (req, res) => {
  try {
    const {
      name,
      phone,
      hostel,
      course,
      year,
      state,
      city,
      college,
      profileImage,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update only supplied fields
    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (hostel !== undefined) {
      user.hostel = hostel;
    }

    if (course !== undefined) {
      user.course = course;
    }

    if (year !== undefined) {
      user.year = year;
    }

    if (state !== undefined) {
      user.state = state || undefined;
    }

    if (city !== undefined) {
      user.city = city ? city.trim() : "";
    }

    if (college !== undefined) {
      user.college = college || undefined;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    const updated = await user.save();

    const populated = await User.findById(updated._id)
      .select("-password")
      .populate("state", "name code")
      .populate("college", "name city type website");

    res.json(populated);
  } catch (err) {
    console.error("Update profile error:", err);

    res.status(500).json({
      message: err.message || "Failed to update profile",
    });
  }
};

// =====================================================
// PUT /api/auth/change-password
// =====================================================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({
        message: "Incorrect current password",
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);

    res.status(500).json({
      message: err.message || "Failed to change password",
    });
  }
};

// =====================================================
// GET /api/auth/users/:id
// Public User Profile
// =====================================================

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("state", "name code")
      .populate("college", "name city type");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const [activeItems, completedRentals, reviews] =
      await Promise.all([
        Item.find({
          owner: user._id,
          status: "active",
        }).select(
          "name pricePerDay image images category condition location rating ratingCount"
        ),

        Rental.countDocuments({
          $or: [
            { owner: user._id },
            { renter: user._id },
          ],
          status: "Completed",
        }),

        Review.find({
          reviewedUser: user._id,
        })
          .populate("reviewer", "name profileImage")
          .populate("item", "name")
          .sort({ createdAt: -1 })
          .limit(10),
      ]);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      hostel: user.hostel,
      profileImage: user.profileImage,
      state: user.state,
      city: user.city,
      college: user.college,
      course: user.course,
      year: user.year,
      rating: user.rating,
      ratingCount: user.ratingCount,
      activeItems,
      completedRentals,
      reviews,
    });
  } catch (err) {
    console.error("Get user profile error:", err);

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    res.status(500).json({
      message: err.message || "Failed to fetch user profile",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  getUserProfile,
};
