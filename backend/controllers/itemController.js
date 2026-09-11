const Item = require("../models/Item");
const Rental = require("../models/Rental");
const Review = require("../models/Review");
const College = require("../models/College");

// =====================================================
// GET /api/items
// Supports:
// ?search=&category=&state=&college=&minPrice=&maxPrice=
// &condition=&available=&sort=&page=&limit=
// =====================================================

const getItems = async (req, res) => {
  try {
    const {
      search,
      category,
      state,
      city,
      college,
      minPrice,
      maxPrice,
      condition,
      available,
      minRating,
      rating,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      status: { $ne: "inactive" },
    };

    // Search
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category
    if (category && category !== "All") {
      query.category = category;
    }

    // College / City / State
    if (college) {
      query.college = college;
    } else if (city || state) {
      const collegeFilter = { active: true };
      if (state) collegeFilter.state = state;
      if (city) collegeFilter.city = { $regex: new RegExp(`^${city.trim()}$`, "i") };

      const collegesInArea = await College.find(collegeFilter).select("_id");
      const collegeIds = collegesInArea.map((c) => c._id);
      query.college = {
        $in: collegeIds,
      };
    }

    // Condition
    if (condition && condition !== "All") {
      query.condition = condition;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.pricePerDay = {};

      if (minPrice) {
        query.pricePerDay.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.pricePerDay.$lte = Number(maxPrice);
      }
    }

    // Availability
    if (available === "true") {
      query.available = true;
    } else if (available === "false") {
      query.available = false;
    }

    // Rating filter
    const effectiveRating = minRating || rating;
    if (effectiveRating) {
      query.rating = { $gte: Number(effectiveRating) };
    }

    // Sorting
    let sortOption = {
      createdAt: -1,
    };

    if (sort === "price_asc") {
      sortOption = {
        pricePerDay: 1,
      };
    } else if (sort === "price_desc") {
      sortOption = {
        pricePerDay: -1,
      };
    } else if (sort === "rating") {
      sortOption = {
        rating: -1,
        ratingCount: -1,
      };
    } else if (sort === "popular") {
      sortOption = {
        views: -1,
      };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 12);

    const [items, total] = await Promise.all([
      Item.find(query)
        .populate(
          "owner",
          "name email phone hostel rating profileImage"
        )
        .populate({
          path: "college",
          select: "name city type website state code",
          populate: { path: "state", select: "name code" },
        })
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),

      Item.countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    console.error("Get items error:", err);

    res.status(500).json({
      message: err.message || "Failed to fetch items",
    });
  }
};

// =====================================================
// GET /api/items/:id
// =====================================================

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate(
        "owner",
        "name email hostel phone rating ratingCount course year profileImage"
      )
      .populate({
        path: "college",
        select: "name city type website state code",
        populate: { path: "state", select: "name code" },
      });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Increment views
    item.views = (item.views || 0) + 1;
    await item.save();

    // Fetch recent reviews
    const reviews = await Review.find({
      item: item._id,
    })
      .populate("reviewer", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      item,
      reviews,
    });
  } catch (err) {
    console.error("Get item error:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    res.status(500).json({
      message: err.message || "Failed to fetch item",
    });
  }
};

// =====================================================
// GET /api/items/mine/list
// =====================================================

const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({
      owner: req.user._id,
    })
      .populate("college", "name city")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("Get my items error:", err);

    res.status(500).json({
      message: err.message || "Failed to fetch your items",
    });
  }
};

// =====================================================
// POST /api/items
// =====================================================

const createItem = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      pricePerDay,
      deposit,
      condition,
      location,
      college,
    } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      pricePerDay === undefined
    ) {
      return res.status(400).json({
        message:
          "Name, description, category, and price are required",
      });
    }

    if (Number(pricePerDay) < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    // Handle multiple uploaded files
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
    } else if (req.file) {
      images = [
        `/uploads/${req.file.filename}`,
      ];
    }

    const itemCollege = college || req.user.college;

    const item = await Item.create({
      name,
      description,
      category,
      pricePerDay: Number(pricePerDay),
      deposit: Number(deposit) || 0,
      condition: condition || "Good",
      location: location || "",
      owner: req.user._id,
      college: itemCollege || undefined,
      available: true,
      status: "active",
      images,
      image: images[0] || "",
    });

    // Return populated item
    const populated = await Item.findById(item._id)
      .populate(
        "owner",
        "name email phone hostel rating profileImage"
      )
      .populate({
        path: "college",
        select: "name city type website state code",
        populate: { path: "state", select: "name code" },
      });

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create item error:", err);

    res.status(500).json({
      message: err.message || "Failed to create item",
    });
  }
};

// =====================================================
// PUT /api/items/:id
// =====================================================

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Only owner or admin can update
    if (
      item.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only edit your own items",
      });
    }

    const fields = [
      "name",
      "description",
      "category",
      "pricePerDay",
      "deposit",
      "available",
      "condition",
      "location",
      "college",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    // Convert numeric values
    if (req.body.pricePerDay !== undefined) {
      item.pricePerDay = Number(
        req.body.pricePerDay
      );
    }

    if (req.body.deposit !== undefined) {
      item.deposit = Number(
        req.body.deposit
      );
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/${file.filename}`
      );

      item.images = [
        ...(item.images || []),
        ...newImages,
      ];

      if (!item.image) {
        item.image = newImages[0];
      }
    } else if (req.file) {
      const newImage = `/uploads/${req.file.filename}`;

      item.images = [
        newImage,
        ...(item.images || []),
      ];

      item.image = newImage;
    }

    const updated = await item.save();

    const populated = await Item.findById(
      updated._id
    )
      .populate(
        "owner",
        "name email phone hostel rating profileImage"
      )
      .populate({
        path: "college",
        select: "name city type website state code",
        populate: { path: "state", select: "name code" },
      });

    res.json(populated);
  } catch (err) {
    console.error("Update item error:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    res.status(500).json({
      message: err.message || "Failed to update item",
    });
  }
};

// =====================================================
// DELETE /api/items/:id
// =====================================================

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Only owner or admin can delete
    if (
      item.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only delete your own items",
      });
    }

    // Check active rentals
    const activeRental = await Rental.findOne({
      item: item._id,
      status: {
        $in: [
          "Pending",
          "Accepted",
          "Active",
        ],
      },
    });

    if (activeRental) {
      return res.status(400).json({
        message:
          "Cannot delete an item with an active or pending rental",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Item removed successfully",
    });
  } catch (err) {
    console.error("Delete item error:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid item id",
      });
    }

    res.status(500).json({
      message: err.message || "Failed to delete item",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getItems,
  getItemById,
  getMyItems,
  createItem,
  updateItem,
  deleteItem,
};
