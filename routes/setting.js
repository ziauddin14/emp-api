import express from "express";
import changePassword from "../controllers/settingController.js";
import authenticateUser from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put("/change-password", authenticateUser,changePassword);

export default router;
