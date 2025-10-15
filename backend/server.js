const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ✨ THIS IS THE FINAL & PERMANENT CORS CONFIGURATION ✨
// This tells your server to trust your main Vercel URL AND any temporary deployment URLs.
const allowedOrigins = [
  "https://cement-project-five.vercel.app" // Your main live Vercel URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // This regex matches any temporary Vercel URL like 'cement-project-xxxx.vercel.app'
    const vercelPreviewRegex = /^https:\/\/cement-project-.*\.vercel\.app$/;

    // Allow requests if they are in our list, match the regex, or have no origin (like Postman)
    if (!origin || allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
      callback(null, true);
    } else {
      console.error("CORS Error: Origin not allowed ->", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


app.use(express.json());

// Routes (Your existing routes are perfect)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/managers", require("./routes/managerRoutes"));
app.use("/api/stacks", require("./routes/stackRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/salary", require("./routes/salaryRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/employee-attendance", require("./routes/employeeAttendanceRoutes"));
// ✅ ADD THIS NEW LINE FOR THE CHATBOT
app.use("/api/chatbot", require("./routes/chatbotRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));