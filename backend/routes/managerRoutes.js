const express = require("express");
const router = express.Router();
const Manager = require("../models/Manager");
const Attendance = require("../models/Attendance");
const bcrypt = require("bcryptjs");

// ===================== MANAGER CRUD =====================

// ➕ Add Manager
router.post("/", async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = new Manager({
      ...rest,
      password: hashedPassword,
    });

    await newManager.save();
    res.status(201).json(newManager);
  } catch (err) {
    console.error("❌ Error saving manager:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📃 Get all managers
router.get("/", async (req, res) => {
  try {
    const managers = await Manager.find();
    res.json(managers);
  } catch (err) {
    console.error("❌ Error fetching all managers:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🆔 Get manager by custom field `managerId` (ex: "01")
router.get("/byManagerId/:mid", async (req, res) => {
  try {
    const manager = await Manager.findOne({ managerId: req.params.mid });
    if (!manager) {
      return res.status(404).json({ msg: "Manager not found by managerId" });
    }
    res.json(manager);
  } catch (err) {
    console.error("❌ Error fetching manager by managerId:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get manager by MongoDB `_id`
router.get("/:id", async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ msg: "Manager not found by _id" });
    }
    res.json(manager);
  } catch (err) {
    console.error("❌ Error fetching manager by _id:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update manager
router.put("/:id", async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    let updateData = { ...rest };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedManager = await Manager.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedManager);
  } catch (err) {
    console.error("❌ Error updating manager:", err);
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete manager
router.delete("/:id", async (req, res) => {
  try {
    await Manager.findByIdAndDelete(req.params.id);
    res.json({ msg: "Manager deleted" });
  } catch (err) {
    console.error("❌ Error deleting manager:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===================== ATTENDANCE CRUD =====================

// ➕ Add attendance (use managerId as reference)
router.post("/attendance/:mid", async (req, res) => {
  try {
    const { date, status, hoursWorked } = req.body;

    const manager = await Manager.findOne({ managerId: req.params.mid });
    if (!manager) {
      return res.status(404).json({ msg: "Manager not found" });
    }

    const newRecord = new Attendance({
      managerId: req.params.mid, // keep consistent with managerId
      date,
      status,
      hoursWorked,
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    console.error("❌ Error adding attendance:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📅 Get attendance by managerId
router.get("/attendance/:mid", async (req, res) => {
  try {
    const records = await Attendance.find({ managerId: req.params.mid }).sort({
      date: -1,
    });
    res.json(records);
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Alias route for consistency (/attendance/byManagerId/:mid)
router.get("/attendance/byManagerId/:mid", async (req, res) => {
  try {
    const records = await Attendance.find({ managerId: req.params.mid }).sort({
      date: -1,
    });
    res.json(records);
  } catch (err) {
    console.error("❌ Error fetching attendance (alias):", err);
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update attendance
router.put("/attendance/update/:attendanceId", async (req, res) => {
  try {
    const { date, status, hoursWorked } = req.body;

    const updated = await Attendance.findByIdAndUpdate(
      req.params.attendanceId,
      { date, status, hoursWorked },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Attendance not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating attendance:", err);
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete attendance
router.delete("/attendance/delete/:attendanceId", async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.attendanceId);

    if (!deleted) {
      return res.status(404).json({ msg: "Attendance not found" });
    }

    res.json({ msg: "Attendance deleted" });
  } catch (err) {
    console.error("❌ Error deleting attendance:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
