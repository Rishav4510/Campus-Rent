const State = require("../models/State");
const College = require("../models/College");

// @route GET /api/states
const getStates = async (req, res) => {
  try {
    const states = await State.find({ active: true }).sort({ name: 1 });
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/colleges/cities?state=stateId
// Returns distinct cities for a given state (or across all colleges)
const getCities = async (req, res) => {
  try {
    const { state } = req.query;
    const filter = { active: true };
    if (state) {
      filter.state = state;
    }

    const cities = await College.distinct("city", filter);
    // Sort cleanly ignoring casing
    const sortedCities = cities
      .filter((c) => Boolean(c && c.trim()))
      .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

    res.json(sortedCities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/colleges?state=stateId&city=cityName&search=keyword&limit=100
const getColleges = async (req, res) => {
  try {
    const { state, city, search, limit } = req.query;
    const query = { active: true };

    if (state) {
      query.state = state;
    }
    if (city) {
      query.city = { $regex: new RegExp(`^${city.trim()}$`, "i") };
    }
    if (search) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { name: searchRegex },
        { city: searchRegex },
        { code: searchRegex },
      ];
    }

    const maxLimit = limit ? Math.min(Number(limit), 200) : 0;
    let collegeQuery = College.find(query)
      .populate("state", "name code")
      .sort({ name: 1 });

    if (maxLimit > 0) {
      collegeQuery = collegeQuery.limit(maxLimit);
    }

    const colleges = await collegeQuery;
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/colleges/:id
const getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id).populate("state", "name code");
    if (!college) return res.status(404).json({ message: "College not found" });
    res.json(college);
  } catch (err) {
    res.status(400).json({ message: "Invalid college id" });
  }
};

// @route POST /api/colleges (Admin)
const createCollege = async (req, res) => {
  try {
    const { name, state, city, type, website, code } = req.body;
    if (!name || !state || !city) {
      return res.status(400).json({ message: "Name, state, and city are required" });
    }

    const college = await College.create({
      name: name.trim(),
      state,
      city: city.trim(),
      type: type || "University",
      website: website ? website.trim() : "",
      code: code ? code.trim().toUpperCase() : "",
      status: "active",
      active: true,
    });

    const populated = await college.populate("state", "name code");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/colleges/:id (Admin)
const updateCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: "College not found" });

    const fields = ["name", "state", "city", "type", "website", "code", "active", "status"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        college[f] = req.body[f];
      }
    });

    // Synchronize active and status
    if (req.body.active !== undefined) {
      college.status = req.body.active ? "active" : "inactive";
    } else if (req.body.status !== undefined) {
      college.active = req.body.status === "active";
    }

    const updated = await college.save();
    const populated = await updated.populate("state", "name code");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/colleges/:id/status (Admin)
const toggleCollegeStatus = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: "College not found" });

    college.active = !college.active;
    college.status = college.active ? "active" : "inactive";
    await college.save();

    res.json({
      message: `College ${college.active ? "activated" : "deactivated"} successfully`,
      college,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStates,
  getCities,
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  toggleCollegeStatus,
};
