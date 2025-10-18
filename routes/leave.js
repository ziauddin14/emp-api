import express from "express";
import { addLeave, getLeave, getLeaveDetails, getLeaves, updateLeave } from "../controllers/leaveController.js";

const router = express.Router();

router.post("/add", addLeave);
router.get("/:id", getLeave);
router.get("/detail/:id", getLeaveDetails);
router.get("/", getLeaves)
router.put("/:id",  updateLeave)


export default router;
