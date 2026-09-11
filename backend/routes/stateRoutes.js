const express = require("express");
const router = express.Router();
const { getStates } = require("../controllers/stateCollegeController");

router.get("/", getStates);

module.exports = router;
