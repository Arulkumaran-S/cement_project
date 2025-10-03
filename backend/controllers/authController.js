const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, shift } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      shift,
    });

    await user.save();

    res.status(201).json({ msg: "User registered successfully", user });
  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🧾 Login Attempt:", { email, password });

    // Find user by email
    const user = await User.findOne({ email });
    console.log("🔍 Found User:", user ? user.email : "null");

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ msg: "User not found" });
    }

    // Compare passwords
    console.log("Stored password hash:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔐 Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in .env");
      return res.status(500).json({ msg: "Server misconfiguration" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, shift: user.shift },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ JWT Token Generated");

    res.json({ token, user });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
