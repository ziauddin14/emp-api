import express from "express";
import {
  addEmployee,
  fetchEmployeesByDepId,
  getEmployee,
  getEmployees,
  updateEmployee,
} from "../controllers/employeeController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getEmployee);
router.post("/add", upload.single("image"), addEmployee);
router.get("/single/:id", getEmployees);
router.put("/update/:id", updateEmployee);
router.get('/department/:id', fetchEmployeesByDepId)

export default router;