import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { v2 as cloudinary } from "cloudinary";

// Add Employee
const addEmployee = async (req, res) => {
  try {
    // very verbose logs for debugging
    console.log("---- New Add Employee Request ----");
    console.log("Request headers:", req.headers?.["content-type"] || "no content-type");
    console.log("Raw body (req.body):", req.body);
    console.log("Uploaded file (req.file):", req.file);

    // Quick check: body exists?
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("ERROR: req.body is empty. Likely frontend didn't send form-data or content-type mismatch.");
      return res.status(400).json({ success: false, error: "Request body empty. Send multipart/form-data." });
    }

    // destructure and validate required fields
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password,
      role,
    } = req.body;

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!employeeId) missingFields.push("employeeId");
    if (!password) missingFields.push("password");

    if (missingFields.length) {
      console.error("ERROR: Missing required fields:", missingFields);
      return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    // check user exists
    const user = await User.findOne({ email });
    if (user) {
      console.warn("WARN: User already exists with email:", email);
      return res.status(400).json({ success: false, error: "User already registered" });
    }

    // hash password safely
    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (hashErr) {
      console.error("ERROR: bcrypt.hash failed:", hashErr);
      return res.status(500).json({ success: false, error: "Password hashing failed" });
    }

    // create user
    const newUser = new User({ name, email, password: hashPassword, role });
    let savedUser;
    try {
      savedUser = await newUser.save();
    } catch (saveUserErr) {
      console.error("ERROR: saving User failed:", saveUserErr);
      // check duplicate key error
      if (saveUserErr.code === 11000) {
        return res.status(400).json({ success: false, error: "Email already exists (duplicate)" });
      }
      return res.status(500).json({ success: false, error: "Saving user failed" });
    }

    // handle image upload (optional)
    let imageUrl = "";
    if (req.file) {
      try {
        // If you're using multer.diskStorage, req.file.path should exist
        console.log("Uploading to Cloudinary, file path:", req.file.path || req.file.location || req.file.buffer ? "(has file)" : "(no path)");
        const uploadResult = await cloudinary.uploader.upload(req.file.path);
        imageUrl = uploadResult.secure_url || "";
        console.log("Cloudinary upload success:", imageUrl);
      } catch (cloudErr) {
        console.error("ERROR: Cloudinary upload failed:", cloudErr);
        // decide: either rollback savedUser or continue without image — here we'll delete user and return error
        try {
          await User.findByIdAndDelete(savedUser._id);
          console.log("Rolled back created user due to image upload failure");
        } catch (rbErr) {
          console.error("Failed to rollback user after cloudinary failure:", rbErr);
        }
        return res.status(500).json({ success: false, error: "Image upload failed" });
      }
    } else {
      console.warn("WARN: No file uploaded (req.file is undefined). If you expected an image, ensure frontend sends 'profileImage' with FormData.");
    }

    // Create employee doc
    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      profileImage: imageUrl,
    });

    try {
      await newEmployee.save();
    } catch (saveEmployeeErr) {
      console.error("ERROR: saving Employee failed:", saveEmployeeErr);
      // try rollback user also
      try {
        await User.findByIdAndDelete(savedUser._id);
        console.log("Rolled back created user due to employee save failure");
      } catch (rbErr) {
        console.error("Failed to rollback user after employee save failure:", rbErr);
      }
      return res.status(500).json({ success: false, error: "Saving employee failed" });
    }

    console.log("SUCCESS: Employee created with userId:", savedUser._id);
    return res.status(201).json({ success: true, message: "Employee created successfully" });

  } catch (error) {
    // This is a catch-all — log stack so you know exact cause
    console.error("UNCAUGHT ERROR in addEmployee:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
};


// Get All Employees
const getEmployee = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", "name email profileImage role")
      .populate("department");

    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("get employee error:", error);
    return res
      .status(500)
      .json({ success: false, error: "get employees server error" });
  }
};


// Get Single Employee
const getEmployees = async (req, res) => {
  const { id } = req.params;
  try {
    let employee;
    employee = await Employee.findById({ _id: id })
      .populate("userId", "name email profileImage")
      .populate("department");

    if (!employee) {
      employee = await Employee.findOne({ userId: id })
        .populate("userId", { password: 0 })
        .populate("department");
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get single employee server error" });
  }
};

// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      profileImage,
    } = req.body;

    //  find employee
    const employee = await Employee.findById(id).populate("userId");
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    //  Update user data
    const user = await User.findById(employee.userId._id);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (profileImage) user.profileImage = profileImage;
      await user.save();
    }

    //  Update employee data
    employee.dob = dob || employee.dob;
    employee.gender = gender || employee.gender;
    employee.maritalStatus = maritalStatus || employee.maritalStatus;
    employee.designation = designation || employee.designation;
    employee.department = department || employee.department;
    employee.salary = salary || employee.salary;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      success: false,
      error: "update employee server error",
    });
  }
};
const fetchEmployeesByDepId = async (req, res) => {
  const { id } = req.params;
  try {
    const employees = await Employee.find({ department: id });
    if (!employees) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get single employee server error" });
  }
};
export {
  addEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
  fetchEmployeesByDepId,
};
