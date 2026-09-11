const Rental = require("../models/Rental");
const Item = require("../models/Item");
const Notification = require("../models/Notification");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// @route POST /api/rentals
const createRental = async (req, res) => {
  try {
    const { itemId, startDate, endDate, note } = req.body;

    if (!itemId || !startDate || !endDate) {
      return res.status(400).json({
        message: "Item, start date, and end date are required",
      });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // User cannot rent own item
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot rent your own item",
      });
    }

    // Check availability
    if (!item.available || item.status === "rented") {
      return res.status(400).json({
        message: "This item is currently unavailable",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid dates provided",
      });
    }

    // Remove time portion
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    const diffDays = Math.round((end - start) / MS_PER_DAY);

    // Same-day rental = 1 day
    const days = Math.max(1, diffDays + 1);

    const rentalCost = days * Number(item.pricePerDay || 0);
    const deposit = Number(item.deposit || 0);
    const totalPrice = rentalCost + deposit;

    const rental = await Rental.create({
      item: item._id,
      renter: req.user._id,
      owner: item.owner,
      college: item.college,
      startDate: start,
      endDate: end,
      days,
      rentalCost,
      deposit,
      totalPrice,
      note: note || "",
      status: "Pending",
    });

    // Notify owner
    await Notification.create({
      user: item.owner,
      type: "rental_request",
      title: "New Rental Request",
      message: `${req.user.name} requested to rent "${item.name}" for ${days} day(s).`,
      link: "/my-items",
    });

    // Return populated rental
    const populated = await Rental.findById(rental._id)
      .populate(
        "item",
        "name image images pricePerDay deposit category condition location"
      )
      .populate(
        "owner",
        "name email phone hostel"
      )
      .populate(
        "renter",
        "name email phone hostel course year"
      );

    return res.status(201).json(populated);
  } catch (err) {
    console.error("Create Rental Error:", err);

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

// @route GET /api/rentals/mine
// Rentals made by logged-in user
const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      renter: req.user._id,
    })
      .populate(
        "item",
        "name image images pricePerDay deposit category condition location"
      )
      .populate(
        "owner",
        "name email phone hostel rating profileImage"
      )
      .populate(
        "college",
        "name city"
      )
      .sort({ createdAt: -1 });

    return res.json(rentals);
  } catch (err) {
    console.error("Get My Rentals Error:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

// @route GET /api/rentals/requests
// Rental requests received by item owner
const getOwnerRequests = async (req, res) => {
  try {
    const rentals = await Rental.find({
      owner: req.user._id,
    })
      .populate(
        "item",
        "name image images pricePerDay deposit category condition location"
      )
      .populate(
        "renter",
        "name email phone hostel course year rating profileImage"
      )
      .populate(
        "college",
        "name city"
      )
      .sort({ createdAt: -1 });

    return res.json(rentals);
  } catch (err) {
    console.error("Get Owner Requests Error:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

// @route PUT /api/rentals/:id/status
const updateRentalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Accepted",
      "Rejected",
      "Active",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental request not found",
      });
    }

    const isOwner =
      rental.owner.toString() === req.user._id.toString();

    const isRenter =
      rental.renter.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    // Accept / Reject
    if (
      ["Accepted", "Rejected"].includes(status) &&
      !isOwner &&
      !isAdmin
    ) {
      return res.status(403).json({
        message: "Only the item owner or admin can accept or reject a request",
      });
    }

    // Active / Completed
    if (
      ["Active", "Completed"].includes(status) &&
      !isOwner &&
      !isAdmin
    ) {
      return res.status(403).json({
        message: "Only the item owner or admin can perform this action",
      });
    }

    // Cancel
    if (
      status === "Cancelled" &&
      !isRenter &&
      !isOwner &&
      !isAdmin
    ) {
      return res.status(403).json({
        message: "Not authorized to cancel this rental",
      });
    }

    const previousStatus = rental.status;

    rental.status = status;

    await rental.save();

    // Find item
    const item = await Item.findById(rental.item);

    // Keep item availability in sync
    if (item) {
      if (status === "Accepted" || status === "Active") {
        item.available = false;
        item.status = "rented";

        await item.save();
      }

      if (
        ["Completed", "Cancelled", "Rejected"].includes(status)
      ) {
        // Check whether another active rental exists
        const otherActive = await Rental.findOne({
          item: item._id,
          _id: { $ne: rental._id },
          status: {
            $in: ["Accepted", "Active"],
          },
        });

        if (!otherActive) {
          item.available = true;
          item.status = "active";

          await item.save();
        }
      }
    }

    // Notifications
    if (status === "Accepted") {
      await Notification.create({
        user: rental.renter,
        type: "rental_accepted",
        title: "Rental Request Accepted! 🎉",
        message: `Your request for "${item?.name || "an item"}" was accepted. You can now coordinate pickup.`,
        link: "/my-rentals",
      });
    }

    if (status === "Rejected") {
      await Notification.create({
        user: rental.renter,
        type: "rental_rejected",
        title: "Rental Request Declined",
        message: `The owner declined the request for "${item?.name || "an item"}".`,
        link: "/my-rentals",
      });
    }

    if (status === "Completed") {
      await Notification.create({
        user: rental.renter,
        type: "rental_completed",
        title: "Rental Completed!",
        message: `Your rental for "${item?.name || "an item"}" is completed. Please leave a review!`,
        link: "/my-rentals",
      });
    }

    // Return populated rental
    const populated = await Rental.findById(rental._id)
      .populate(
        "item",
        "name image images pricePerDay deposit category condition location"
      )
      .populate(
        "owner",
        "name email phone hostel"
      )
      .populate(
        "renter",
        "name email phone hostel course year"
      );

    return res.json(populated);
  } catch (err) {
    console.error("Update Rental Status Error:", err);

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

module.exports = {
  createRental,
  getMyRentals,
  getOwnerRequests,
  updateRentalStatus,
};
