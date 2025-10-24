import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { v2 as cloudinary } from "cloudinary";

// Add Employee


const addEmployee = async (req, res) => {
  try {
    console.log("🟢 Request received at /api/employee/add");
    console.log("🧾 req.body:", req.body);
    console.log("📸 req.file:", req.file);

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

    // 1️⃣ Check duplicate user
    const user = await User.findOne({ email });
    if (user) {
      console.log("⚠️ User already exists:", email);
      return res.status(400).json({
        success: false,
        error: "User already registered in employee",
      });
    }

    // 2️⃣ Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create user first
    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role,
    });

    const savedUser = await newUser.save();
    console.log("✅ User saved:", savedUser._id);

    // 4️⃣ Upload image if present
    let imageUrl = "";
    if (req.file) {
      try {
        console.log("🚀 Uploading to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "EMS_Profile_Images",
        });
        imageUrl = uploadResult.secure_url;
        console.log("✅ Image uploaded:", imageUrl);
      } catch (cloudErr) {
        console.error("❌ Cloudinary upload failed:", cloudErr.message);
        return res.status(500).json({
          success: false,
          error: `Cloudinary upload failed: ${cloudErr.message}`,
        });
      }
    } else {
      console.log("⚠️ No image file received in req.file");
    }

    // 5️⃣ Create Employee
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

    await newEmployee.save();
    console.log("🎉 Employee saved successfully:", employeeId);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
    });
  } catch (error) {
    console.error("🔥 Error while saving employee:", error.message);
    console.error("🧩 Full Error Stack:", error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
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
