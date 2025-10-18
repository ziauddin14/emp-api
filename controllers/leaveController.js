import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import { response } from "express";

// Add Leave
const addLeave = async (req, res) => {
  try {
    const { userId, leaveType, startDate, endDate, reason } = req.body;

    // Find employee by userId
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    // Create new leave using employee's _id
    const newLeave = new Leave({
      employeeId: employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await newLeave.save();
    return res
      .status(200)
      .json({ success: true, message: "Leave added successfully" });
  } catch (error) {
    console.error("Add Leave Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Leave add server error" });
  }
};

// Get Leaves by userId
const getLeave = async (req, res) => {
  try {
    const { id } = req.params;

    // first try by employeeId
    let leaves = await Leave.find({ employeeId: id });

    // if not found, try by userId
    if (leaves.length === 0) {
      const employee = await Employee.findOne({ userId: id });
      if (!employee) {
        return res.status(404).json({ success: false, error: "Employee not found" });
      }
      leaves = await Leave.find({ employeeId: employee._id });
    }

    return res.status(200).json({ success: true, leaves });
  } catch (error) {
    console.error("Get Leave Error:", error);
    return res.status(500).json({ success: false, error: "Leave get server error" });
  }
};

const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate({
      path: "employeeId",
      populate: [
        { path: "department", select: "dep_name" },
        { path: "userId", select: "name" },
      ],
    });

    res.status(200).json({ success: true, leaves });
  } catch (error) {
    console.error("Get Leave Error:", error);
    res.status(500).json({ success: false, error: "Leave get server error" });
  }
};
const getLeaveDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const leave = await Leave.findById({ _id: id }).populate({
      path: "employeeId",
      populate: [
        { path: "department", select: "dep_name" },
        { path: "userId", select: "name" },
      ],
    });

    res.status(200).json({ success: true, leave });
  } catch (error) {
    console.error("Get Leave Error:", error);
    res.status(500).json({ success: false, error: "Leave get server error" });
  }
};

const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ success: false, error: "Leave not found" });
    }

    return res.status(200).json({ success: true, leave });
  } catch (error) {
    console.error("Update Leave Error:", error);
    return res.status(500).json({ success: false, error: "Leave update server error" });
  }
};

export { addLeave, getLeave, getLeaves, getLeaveDetails, updateLeave };
