import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

const addSalary = async (req, res) => {
  try {
    const { employeeId, basicSalary, allowances, deductions, payDate } = req.body;
    const totalSalary = parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions);

    const newSalary = new Salary({
      employeeId,
      basicSalary,
      allowances,
      deductions,
      netSalary: totalSalary,
      payDate,
    });

    await newSalary.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Salary add error:", error);
    return res.status(500).json({ success: false, error: "salary add server error" });
  }
};

// ✅ Salary fetch (Employee login karta hai)
const getSalary = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by userId first
    let employee = await Employee.findOne({ userId: id });

    // If not found, maybe it's already employeeId
    if (!employee) {
      employee = await Employee.findById(id);
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found for this ID.",
      });
    }

    const salary = await Salary.find({ employeeId: employee._id }).populate(
      "employeeId",
      "employeeId"
    );

    if (!salary || salary.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No salary records found for this employee.",
      });
    }

    return res.status(200).json({
      success: true,
      salary,
    });
  } catch (error) {
    console.error("Server error (getSalary):", error.message);
    return res.status(500).json({
      success: false,
      error: "Salary get server error",
    });
  }
};


export { addSalary, getSalary };
