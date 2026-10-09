
const mongoose = require("mongoose");

const removeLegacyUsernameIndex = async () => {
  if (!mongoose.connection.db) {
    return;
  }

  const usersCollectionExists = await mongoose.connection.db
    .listCollections({ name: "users" })
    .hasNext();

  if (!usersCollectionExists) {
    return;
  }

  const usersCollection = mongoose.connection.collection("users");
  const indexes = await usersCollection.indexes();
  const legacyIndex = indexes.find(
    (index) =>
      index.name === "username_1" ||
      (index.key && Object.keys(index.key).length === 1 && index.key.username === 1)
  );

  if (legacyIndex) {
    await usersCollection.dropIndex(legacyIndex.name);
    console.log(`Removed legacy MongoDB index: ${legacyIndex.name}`);
  }
};

const bcrypt = require("bcryptjs");

const seedInitialData = async () => {
  try {
    const User = require("../models/User");
    const Community = require("../models/Community");

    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("1234567890", 10);
      await User.create({
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        phone: "9876543210",
        role: "ADMIN",
        residentType: "OWNER",
        community: "Emerald Towers Enclave",
        houseNumber: "ADMIN-01"
      });
      console.log(`Seeded default Admin user: ${adminEmail}`);
    }

    const communityCount = await Community.countDocuments();
    if (communityCount === 0) {
      await Community.insertMany([
        {
          name: "Emerald Towers Enclave",
          location: "North Sector 4",
          code: "COMM-101",
          totalBlocks: 4,
          totalFlats: 120,
          managerName: "Vikramaditya Das"
        },
        {
          name: "Sapphire Heights Society",
          location: "South Sector 2",
          code: "COMM-102",
          totalBlocks: 3,
          totalFlats: 90,
          managerName: "Ananya Sharma"
        },
        {
          name: "Ruby Court Residency",
          location: "East Sector 5",
          code: "COMM-103",
          totalBlocks: 5,
          totalFlats: 150,
          managerName: "Rajesh Nair"
        },
        {
          name: "Diamond Crest Community",
          location: "West Sector 8",
          code: "COMM-104",
          totalBlocks: 2,
          totalFlats: 60,
          managerName: "Sneha Patel"
        }
      ]);
      console.log("Seeded default initial communities");
    }

    // 3. Seed initial society records & bylaws if none exist
    const Record = require("../models/Record");
    const recordCount = await Record.countDocuments();
    if (recordCount === 0) {
      const adminUser = await User.findOne({ email: "admin@gmail.com" });
      if (adminUser) {
        await Record.insertMany([
          {
            title: "Society Registered Bylaws & Resident Code of Conduct (2025 Revised)",
            category: "BYLAWS",
            referenceCode: "BYLAW-RWA-2025",
            description: "Official registered bylaws outlining resident rights, committee duties, maintenance fee schedules, quiet hours (10 PM - 6 AM), and common area usage rules.",
            uploadedBy: adminUser._id,
            community: "Emerald Towers Enclave",
            effectiveDate: new Date("2025-01-01")
          },
          {
            title: "Annual General Body Meeting (AGM) Minutes & Fiscal Resolutions",
            category: "AGM_MINUTES",
            referenceCode: "AGM-MIN-2025-Q4",
            description: "Minutes of the December General Body Meeting. Approved lift modernization fund, security guard biometric gate system, and audited financial statements.",
            uploadedBy: adminUser._id,
            community: "Emerald Towers Enclave",
            effectiveDate: new Date("2025-12-15")
          },
          {
            title: "Managing Committee Election & Handover Protocol Register",
            category: "COMMITTEE_HANDOVER",
            referenceCode: "HANDOVER-LOG-2025",
            description: "Signed transition audit: Vendor contracts, bank account signing authority handover, AMC warranties (DG sets, STP, Elevators), and keys inventory.",
            uploadedBy: adminUser._id,
            community: "Emerald Towers Enclave",
            effectiveDate: new Date("2025-12-28")
          }
        ]);
        console.log("Seeded initial official bylaws & handover records");
      }
    }
  } catch (seedErr) {
    console.error("Initial data seeding notice:", seedErr.message);
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/we_communicate";

  try {
    console.log(`Connecting to Mongo at: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    await removeLegacyUsernameIndex();
    await seedInitialData();

    console.log("MongoDB Connected Successfully");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    if (error?.code === "ECONNREFUSED" || error?.syscall === "querySrv") {
      console.error(
        "MongoDB is unreachable. Use a valid MONGO_URI or start a local MongoDB instance on localhost:27017."
      );
    }

    return false;
  }
};

module.exports = connectDB;