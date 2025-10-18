import Department from "../models/Department.js";

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    return res.status(200).json({ success: true, departments });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "get department server error" });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { dep_name, description } = req.body;
    const newDepartment = new Department({
      dep_name,
      description,
    });
    await newDepartment.save();
    return res.status(200).json({ success: true, department: newDepartment });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "add department server error" });
  }
};

const editDepartment = async (req, res) => {
  try {
    const { id } = req.query;
    const department = await Department.findById(id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });
    }
    return res.status(200).json({ success: true, department });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "edit department server error" });
  }
};
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { dep_name, description } = req.body;

    const updated = await Department.findByIdAndUpdate(
      id,
      { dep_name, description },
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });

    return res
      .status(200)
      .json({
        success: true,
        message: "Department updated",
        department: updated,
      });
  } catch (error) {
    console.error("updateDepartment error:", error);
    return res
      .status(500)
      .json({ success: false, error: "update department server error" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.query;

    const deleteDep = await Department.findById(id);
    await deleteDep.deleteOne()

    if (!deleteDep) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      department: deleteDep,
    });
  } catch (error) {
    console.error("deleteDepartment error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Delete department server error" });
  }
};

export {
  addDepartment,
  getDepartments,
  editDepartment,
  updateDepartment,
  deleteDepartment,
};
