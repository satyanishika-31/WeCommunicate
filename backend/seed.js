const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Community = require("./models/Community");
const Record = require("./models/Record");

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/we_communicate";

  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log("Connected to MongoDB successfully.");

    const adminEmail = "admin@gmail.com";
    const plainPassword = "1234567890";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        phone: "9876543210",
        role: "ADMIN",
        residentType: "OWNER",
        community: "Emerald Towers Enclave",
        houseNumber: "ADMIN-01"
      });
      console.log(`✓ Admin user created: ${adminEmail} (Role: ADMIN, Password: ${plainPassword})`);
    } else {
      admin.role = "ADMIN";
      admin.password = hashedPassword;
      await admin.save();
      console.log(`✓ Existing user ${adminEmail} updated to Role: ADMIN with password: ${plainPassword}`);
    }

    // Communities
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
        }
      ]);
      console.log("✓ Default communities seeded.");
    }

    console.log("\n==========================================");
    console.log("Admin credentials ready:");
    console.log("Email:    admin@gmail.com");
    console.log("Password: 1234567890");
    console.log("Role:     ADMIN");
    console.log("==========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seedDatabase();
