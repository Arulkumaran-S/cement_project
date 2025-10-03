const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User"); // check path if your User model is in models/User.js

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    // Hash password "123"
    const hashedPassword = await bcrypt.hash("123", 10);

    const users = [
      {
        name: "Admin User",
        email: "admin@cementcrm.com",
        password: hashedPassword,
        role: "admin",
        shift: "general",   // required field
      },
      {
        name: "Manager User",
        email: "manager@cementcrm.com",
        password: hashedPassword,
        role: "manager",
        shift: "general",
      },
      {
        name: "Stack User",
        email: "stack@cementcrm.com",
        password: hashedPassword,
        role: "stack",
        shift: "general",
      }
    ];

    // Delete old entries (optional)
    await User.deleteMany({
      email: {
        $in: ["admin@cementcrm.com", "manager@cementcrm.com", "stack@cementcrm.com"],
      },
    });

    // Insert fresh
    await User.insertMany(users);

    console.log("✅ Admin, Manager & Stack users inserted successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    mongoose.connection.close();
  }
};

seedUsers();
