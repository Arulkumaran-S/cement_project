const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- FINAL TEST ROUTE ---
// This will prove the server is live and running.
app.get("/", (req, res) => {
  res.send("<h1>Congratulations! Your Cement CRM backend is live!</h1>");
});


// --- YOUR API ROUTES ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/managers", require("./routes/managerRoutes"));
app.use("/api/stacks", require("./routes/stackRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/salary", require("./routes/salaryRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
