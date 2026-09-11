// Run with: npm run seed
// Creates demo data for CampusRent

require("dotenv").config();

const connectDB = require("../config/db");

const State = require("../models/State");
const College = require("../models/College");
const Category = require("../models/Category");
const User = require("../models/User");
const Item = require("../models/Item");
const Rental = require("../models/Rental");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Favorite = require("../models/Favorite");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Report = require("../models/Report");

// =====================================================
// 1. MASTER STATES & COLLEGES DATASET
// =====================================================

const { allIndianStates, masterColleges } = require("../data/collegesMaster");

// =====================================================
// 2. CATEGORIES
// =====================================================

const defaultCategories = [
  {
    name: "Books",
    icon: "BookOpen",
    description:
      "Textbooks, reference guides, course notes, and novels",
  },
  {
    name: "Calculators",
    icon: "Calculator",
    description:
      "Scientific, engineering, and financial calculators",
  },
  {
    name: "Lab Equipment",
    icon: "FlaskConical",
    description:
      "Lab coats, safety goggles, dissecting sets, and kits",
  },
  {
    name: "Drawing Tools",
    icon: "Compass",
    description:
      "Mini drafters, engineering drawing sheets, compass sets",
  },
  {
    name: "Electronics",
    icon: "Laptop",
    description:
      "Laptops, monitors, chargers, adapters, and Arduino kits",
  },
  {
    name: "Sports Equipment",
    icon: "Trophy",
    description:
      "Badminton rackets, cricket kits, footballs, and gym accessories",
  },
  {
    name: "Cycles",
    icon: "Bike",
    description:
      "Campus commuter bicycles, gear cycles, and locks",
  },
  {
    name: "Hostel Essentials",
    icon: "Home",
    description:
      "Kettles, study lamps, mattress, iron, and storage racks",
  },
  {
    name: "Musical Instruments",
    icon: "Music",
    description:
      "Guitars, keyboards, flutes, and percussion instruments",
  },
  {
    name: "Others",
    icon: "Package",
    description:
      "Miscellaneous student gear and equipment",
  },
];

// =====================================================
// 3. SEED FUNCTION
// =====================================================

const run = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("==============================================");
    console.log("Connected to MongoDB.");
    console.log("Starting CampusRent seed process...");
    console.log("==============================================");

    // =================================================
    // CLEAR OLD DATA
    // =================================================

    await Promise.all([
      State.deleteMany({}),
      College.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
      Item.deleteMany({}),
      Rental.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      Favorite.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Report.deleteMany({}),
    ]);

    console.log("Old data cleaned.");

    // =================================================
    // 1. SEED STATES
    // =================================================

    const createdStates = await State.insertMany(allIndianStates);

    console.log(
      `Seeded ${createdStates.length} Indian States & UTs.`
    );

    // Create state map
    const stateMap = {};

    createdStates.forEach((state) => {
      stateMap[state.code] = state._id;
    });

    // =================================================
    // 2. SEED COLLEGES
    // =================================================

    const collegesData = masterColleges.map((col) => ({
      name: col.name,
      state: stateMap[col.stateCode],
      city: col.city,
      type: col.type,
      website: col.website,
      code: col.code || "",
      status: "active",
      active: true,
    }));

    const createdColleges = await College.insertMany(collegesData);

    console.log(
      `Seeded ${createdColleges.length} Colleges across all Indian States & UTs.`
    );

    // Find colleges needed for users/items
    const kiet = createdColleges.find((college) =>
      college.name.includes("KIET")
    );

    const iitd = createdColleges.find((college) =>
      college.name.includes("IIT) Delhi")
    );

    const coep = createdColleges.find((college) =>
      college.name.includes("COEP")
    );

    const rvce = createdColleges.find((college) =>
      college.name.includes("RV College")
    );

    // Safety check
    if (!kiet || !iitd || !coep || !rvce) {
      throw new Error(
        "Required demo colleges were not found."
      );
    }

    // =================================================
    // 3. SEED CATEGORIES
    // =================================================

    const createdCategories = await Category.insertMany(
      defaultCategories
    );

    console.log(
      `Seeded ${createdCategories.length} Categories.`
    );

    // =================================================
    // 4. SEED USERS
    // =================================================

    const adminUser = await User.create({
      name: "Campus Admin",
      email: "admin@campusrent.com",
      password: "admin123",
      role: "admin",
      phone: "+91 9876543210",
      hostel: "Admin Office",
      state: stateMap["DL"],
      city: "New Delhi",
      college: iitd._id,
      course: "Platform Administration",
      year: "Faculty",
      rating: 5.0,
      ratingCount: 1,
    });

    const rishav = await User.create({
      name: "Rishav Kumar",
      email: "rishav@campusrent.com",
      password: "student123",
      role: "student",
      phone: "+91 9811223344",
      hostel: "Tagore Hostel, Room 204",
      state: stateMap["UP"],
      city: "Ghaziabad",
      college: kiet._id,
      course: "B.Tech Computer Science",
      year: "3rd Year",
      rating: 4.8,
      ratingCount: 12,
    });

    const priya = await User.create({
      name: "Priya Sharma",
      email: "priya@campusrent.com",
      password: "student123",
      role: "student",
      phone: "+91 9722334455",
      hostel: "Kailash Hostel, Room 108",
      state: stateMap["DL"],
      city: "New Delhi",
      college: iitd._id,
      course: "B.Tech Mechanical Engineering",
      year: "2nd Year",
      rating: 4.9,
      ratingCount: 8,
    });

    const aditya = await User.create({
      name: "Aditya Patil",
      email: "aditya@campusrent.com",
      password: "student123",
      role: "student",
      phone: "+91 9633445566",
      hostel: "Shivaji Hostel, Block B",
      state: stateMap["MH"],
      city: "Pune",
      college: coep._id,
      course: "B.Tech Electrical Engineering",
      year: "4th Year",
      rating: 4.7,
      ratingCount: 5,
    });

    const ananya = await User.create({
      name: "Ananya Rao",
      email: "ananya@campusrent.com",
      password: "student123",
      role: "student",
      phone: "+91 9544556677",
      hostel: "Cauvery Block, Room 312",
      state: stateMap["KA"],
      city: "Bengaluru",
      college: rvce._id,
      course: "B.Tech Electronics & Comm.",
      year: "1st Year",
      rating: 5.0,
      ratingCount: 2,
    });

    console.log("Seeded Admin + 4 Students.");

    // =================================================
    // 5. SEED ITEMS
    // =================================================

    const sampleItems = [
      {
        name: "Casio FX-991ES Plus Scientific Calculator",
        description:
          "Official engineering scientific calculator with 417 functions. Perfect for mid-terms, semester exams, and numerical practicals. Includes battery and protective snap-on cover.",
        category: "Calculators",
        pricePerDay: 25,
        deposit: 200,
        condition: "Good",
        location: "Tagore Hostel / Gate 1",
        owner: rishav._id,
        college: kiet._id,
        images: [
          "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
        ],
        image:
          "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
        available: true,
        status: "active",
        views: 42,
        rating: 4.9,
        ratingCount: 7,
      },

      {
        name: "White Cotton Chemistry & Bio Lab Coat (Size M)",
        description:
          "Pure cotton full-sleeve lab apron. Clean, washed, and ironed. Mandatory for first and second year physics/chemistry lab practicals.",
        category: "Lab Equipment",
        pricePerDay: 30,
        deposit: 150,
        condition: "Good",
        location: "Mechanical Dept Lobby",
        owner: priya._id,
        college: iitd._id,
        images: [
          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
        ],
        image:
          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
        available: true,
        status: "active",
        views: 29,
        rating: 4.8,
        ratingCount: 4,
      },

      {
        name: "Omega Engineering Mini Drafter with Board Clips",
        description:
          "Complete engineering graphics set: high-precision steel rod mini drafter, plastic protractor head, 2 drafting board clips, and waterproof carrying bag.",
        category: "Drawing Tools",
        pricePerDay: 35,
        deposit: 300,
        condition: "Like New",
        location: "Cauvery Block / RVCE Canteen",
        owner: ananya._id,
        college: rvce._id,
        images: [
          "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
        ],
        image:
          "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
        available: true,
        status: "active",
        views: 18,
        rating: 5.0,
        ratingCount: 3,
      },

      {
        name: "Hero Sprint Single-Speed Campus Cycle",
        description:
          "Reliable city bicycle with front basket and rear carrier. Great for commuting between hostel block, library, and main academic building. Comes with number lock.",
        category: "Cycles",
        pricePerDay: 50,
        deposit: 500,
        condition: "Fair",
        location: "Cycle Stand near Library",
        owner: aditya._id,
        college: coep._id,
        images: [
          "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80",
        ],
        image:
          "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80",
        available: true,
        status: "active",
        views: 65,
        rating: 4.6,
        ratingCount: 9,
      },

      {
        name: "Yonex Muscle Power 29 Badminton Racket Pair + Shuttlecock",
        description:
          "Two balanced graphite badminton rackets with freshly strung grips, plus a tube of 3 nylon shuttles. Ideal for evening court matches at campus sports complex.",
        category: "Sports Equipment",
        pricePerDay: 40,
        deposit: 300,
        condition: "Good",
        location: "Sports Complex",
        owner: rishav._id,
        college: kiet._id,
        images: [
          "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80",
        ],
        image:
          "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80",
        available: true,
        status: "active",
        views: 31,
        rating: 4.7,
        ratingCount: 6,
      },

      {
        name: "Arduino Uno R3 Starter Kit with Sensors & Breadboard",
        description:
          "Essential embedded systems practical kit: Arduino Uno, jumper wires, breadboard, ultrasonic sensor, IR module, 16x2 LCD display, and servo motor.",
        category: "Electronics",
        pricePerDay: 60,
        deposit: 500,
        condition: "Like New",
        location: "Kailash Hostel / Nilgiri Mess",
        owner: priya._id,
        college: iitd._id,
        images: [
          "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80",
        ],
        image:
          "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80",
        available: true,
        status: "active",
        views: 54,
        rating: 5.0,
        ratingCount: 5,
      },

      {
        name: "Higher Engineering Mathematics by B.S. Grewal (44th Edition)",
        description:
          "Hardcover standard reference book for Engineering Math I, II, and III. Clean pages with minimal pencil highlights. Indispensable for end-sem preparations.",
        category: "Books",
        pricePerDay: 20,
        deposit: 150,
        condition: "Good",
        location: "Central Library Steps",
        owner: rishav._id,
        college: kiet._id,
        images: [
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        ],
        image:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        available: true,
        status: "active",
        views: 22,
        rating: 4.9,
        ratingCount: 2,
      },

      {
        name: "Yamaha F310 Acoustic Guitar with Gig Bag & Picks",
        description:
          "Well-seasoned acoustic guitar with low action, smooth fretboard, and warm acoustic tone. Strings recently tuned. Perfect for club rehearsals or hostel jam sessions.",
        category: "Musical Instruments",
        pricePerDay: 90,
        deposit: 800,
        condition: "Good",
        location: "Hostel Block B, Room 112",
        owner: aditya._id,
        college: coep._id,
        images: [
          "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80",
        ],
        image:
          "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80",
        available: true,
        status: "active",
        views: 78,
        rating: 4.8,
        ratingCount: 8,
      },

      {
        name: "Havells 1.2L Stainless Steel Electric Kettle",
        description:
          "Quick-boil electric kettle for late-night exam study sessions. Useful for preparing instant noodles, coffee, hot water, and tea in hostel rooms.",
        category: "Hostel Essentials",
        pricePerDay: 25,
        deposit: 250,
        condition: "Good",
        location: "Tagore Hostel Gate",
        owner: rishav._id,
        college: kiet._id,
        images: [
          "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
        ],
        image:
          "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
        available: true,
        status: "active",
        views: 38,
        rating: 4.9,
        ratingCount: 5,
      },
    ];

    const createdItems = await Item.insertMany(sampleItems);

    console.log(
      `Seeded ${createdItems.length} rental items.`
    );

    // =================================================
    // 6. SEED SAMPLE RENTAL
    // =================================================

    const sampleRental = await Rental.create({
      item: createdItems[0]._id,
      renter: priya._id,
      owner: rishav._id,
      college: kiet._id,
      condition: "Good",
      location: "Block C",
      startDate: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ),
      endDate: new Date(
        Date.now() - 1 * 24 * 60 * 60 * 1000
      ),
      days: 3,
      rentalCost: 75,
      deposit: 200,
      totalPrice: 275,
      status: "Completed",
      note: "Need for Math III mid-term examination.",
    });

    console.log("Seeded sample rental.");

    // =================================================
    // 7. SEED SAMPLE REVIEW
    // =================================================

    await Review.create({
      rental: sampleRental._id,
      reviewer: priya._id,
      reviewedUser: rishav._id,
      item: createdItems[0]._id,
      rating: 5,
      comment:
        "Rishav handed over the calculator in pristine condition. Battery was fully charged. Saved my exam!",
    });

    console.log("Seeded sample review.");

    // =================================================
    // 8. SEED SAMPLE NOTIFICATION
    // =================================================

    await Notification.create({
      user: rishav._id,
      type: "new_review",
      title: "New Review Received ⭐",
      message:
        'Priya rated your Casio Calculator 5 stars: "Saved my exam!"',
      link: "/my-items",
    });

    console.log("Seeded sample notification.");

    // =================================================
    // FINAL SUCCESS MESSAGE
    // =================================================

    console.log("");
    console.log("====================================================");
    console.log("✅ CAMPUSRENT SEED COMPLETE!");
    console.log("====================================================");
    console.log("");
    console.log("Admin:");
    console.log("  Email:    admin@campusrent.com");
    console.log("  Password: admin123");
    console.log("");
    console.log("Student 1:");
    console.log("  Email:    rishav@campusrent.com");
    console.log("  Password: student123");
    console.log("");
    console.log("Student 2:");
    console.log("  Email:    priya@campusrent.com");
    console.log("  Password: student123");
    console.log("");
    console.log("Student 3:");
    console.log("  Email:    aditya@campusrent.com");
    console.log("  Password: student123");
    console.log("");
    console.log("Student 4:");
    console.log("  Email:    ananya@campusrent.com");
    console.log("  Password: student123");
    console.log("");
    console.log("====================================================");

    process.exit(0);
  } catch (err) {
    console.error("");
    console.error("❌ SEED ERROR");
    console.error("====================================================");
    console.error(err);
    console.error("====================================================");

    process.exit(1);
  }
};

// =====================================================
// START SEED
// =====================================================

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
