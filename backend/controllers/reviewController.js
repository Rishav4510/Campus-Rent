const Review = require("../models/Review");
const Rental = require("../models/Rental");
const Item = require("../models/Item");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @route POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { rentalId, rating, comment } = req.body;

    if (!rentalId || !rating) {
      return res.status(400).json({ message: "Rental ID and rating (1-5) are required" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const rental = await Rental.findById(rentalId);
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    if (rental.status !== "Completed") {
      return res.status(400).json({ message: "Reviews can only be submitted for completed rentals" });
    }

    const isRenter = rental.renter.toString() === req.user._id.toString();
    const isOwner = rental.owner.toString() === req.user._id.toString();

    if (!isRenter && !isOwner) {
      return res.status(403).json({ message: "You were not part of this rental transaction" });
    }

    // Determine who is being reviewed
    const reviewedUserId = isRenter ? rental.owner : rental.renter;

    // Check for duplicate review
    const existing = await Review.findOne({ rental: rental._id, reviewer: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this rental" });
    }

    const review = await Review.create({
      rental: rental._id,
      reviewer: req.user._id,
      reviewedUser: reviewedUserId,
      item: rental.item,
      rating: numRating,
      comment: comment || "",
    });

    // Recalculate average rating for the reviewed user
    const userReviews = await Review.find({ reviewedUser: reviewedUserId });
    const userAvg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    await User.findByIdAndUpdate(reviewedUserId, {
      rating: Number(userAvg.toFixed(1)),
      ratingCount: userReviews.length,
    });

    // Recalculate average rating for the item
    const itemReviews = await Review.find({ item: rental.item });
    const itemAvg = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
    await Item.findByIdAndUpdate(rental.item, {
      rating: Number(itemAvg.toFixed(1)),
      ratingCount: itemReviews.length,
    });

    // Send notification to the reviewed user
    await Notification.create({
      user: reviewedUserId,
      type: "new_review",
      title: "New Rating & Review Received ⭐",
      message: `${req.user.name} rated you ${numRating} stars: "${comment ? comment.slice(0, 50) : "Great experience!"}"`,
      link: `/profile`,
    });

    const populated = await Review.findById(review._id)
      .populate("reviewer", "name profileImage")
      .populate("item", "name");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/reviews/item/:itemId
const getItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ item: req.params.itemId })
      .populate("reviewer", "name profileImage college")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/reviews/user/:userId
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUser: req.params.userId })
      .populate("reviewer", "name profileImage")
      .populate("item", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReview, getItemReviews, getUserReviews };
