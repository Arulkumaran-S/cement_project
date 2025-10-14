const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ✨ THIS IS THE FINAL & CORRECT CORS CONFIGURATION ✨
// This tells your server to only trust requests from your Vercel site.
const allowedOrigins = [
  "https://cement-project-five.vercel.app" // Your live Vercel URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));