// testLogin.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const testLogin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: "admin@cementcrm.com" });
  console.log("🧑 Found Admin User:", user);

  const isMatch = await bcrypt.compare("123", user.password);
  console.log("✅ Password match:", isMatch);

  mongoose.disconnect();
};

testLogin();
