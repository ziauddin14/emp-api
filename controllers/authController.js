import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authenticateUser from "../middlewares/authMiddleware.js";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email : email });
    if (!user) {
      console.log("User not found with email:", email);
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    console.log("Entered password:", password);
    console.log("Stored hash:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Wrong password" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const verifyToken = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};
export { login, verifyToken };