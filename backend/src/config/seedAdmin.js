import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existing) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const admin = new User({
      name: process.env.ADMIN_NAME || "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
    });

    await admin.save(); // ⚠️ important (create ki jagah save)

    console.log("✅ Super Admin Created Successfully");
    console.log("📧 Email:", admin.email);

    process.exit(0);
  } catch (error) {
    console.error("❌ FULL ERROR:", error);
    process.exit(1);
  }
};

seedAdmin();