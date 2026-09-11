// ============================================================================
// CAMPUSRENT - COLLEGE & STATE MASTER IMPORTER
// Upserts States and Colleges into MongoDB without destroying existing users/items
// Run with: node backend/utils/importColleges.js
// ============================================================================

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const State = require("../models/State");
const College = require("../models/College");
const { allIndianStates, masterColleges } = require("../data/collegesMaster");

const importMasterData = async () => {
  try {
    console.log("Connecting to MongoDB for master data sync...");
    await connectDB();

    console.log(`Syncing ${allIndianStates.length} Indian States & UTs...`);
    const stateMap = {};

    for (const stateData of allIndianStates) {
      const stateDoc = await State.findOneAndUpdate(
        { code: stateData.code },
        { name: stateData.name, code: stateData.code, active: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      stateMap[stateData.code] = stateDoc._id;
    }
    console.log("All Indian States & UTs synchronized successfully.");

    console.log(`Syncing ${masterColleges.length} Colleges across India...`);
    let createdCount = 0;
    let updatedCount = 0;

    for (const col of masterColleges) {
      const stateId = stateMap[col.stateCode];
      if (!stateId) {
        console.warn(`Warning: State code ${col.stateCode} not found for college ${col.name}`);
        continue;
      }

      const existing = await College.findOne({
        name: col.name,
        state: stateId,
      });

      if (existing) {
        existing.city = col.city;
        existing.type = col.type || existing.type;
        existing.website = col.website || existing.website;
        existing.code = col.code || existing.code;
        existing.active = true;
        existing.status = "active";
        await existing.save();
        updatedCount++;
      } else {
        await College.create({
          name: col.name,
          state: stateId,
          city: col.city,
          type: col.type || "University",
          website: col.website || "",
          code: col.code || "",
          status: "active",
          active: true,
        });
        createdCount++;
      }
    }

    console.log(`College sync complete: ${createdCount} created, ${updatedCount} updated.`);
    console.log("Master dataset is ready for thousands of colleges.");
    process.exit(0);
  } catch (err) {
    console.error("Master import failed:", err);
    process.exit(1);
  }
};

importMasterData();
