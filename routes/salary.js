import express from "express";
import {addSalary, getSalary} from "../controllers/salaryController.js";
const router = express.Router();

router.post("/add", addSalary);
router.get('/:id', getSalary)

export default router;
