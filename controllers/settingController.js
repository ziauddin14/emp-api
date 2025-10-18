import User from "../models/user.js";
import bcrypt from "bcrypt";

const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    // ✅ 1. Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // ✅ 2. Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Wrong old password" });
    }

    // ✅ 3. Hash new password
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // ✅ 4. Update password
    await User.findByIdAndUpdate(userId, { password: hashPassword });

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, error: "Server error while changing password" });
  }
};

export default changePassword;
