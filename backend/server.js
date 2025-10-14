const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ✨ THIS IS THE ONLY CHANGE - We are being more specific now ✨
// This tells your server to ONLY trust requests from your Netlify website.
const corsOptions = {
  origin: "https://cementcrm.netlify.app",
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