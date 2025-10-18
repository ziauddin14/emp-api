import express from "express";
import { login, verifyToken } from "../controllers/authController.js";
import authenticateUser from "../middlewares/authMiddleware.js";
const router = express.Router();


router.post("/login", login);
router.get("/verify", authenticateUser, verifyToken); 

export default router;