import { User } from "./models/user.js";
import bcrypt from "bcrypt";
import { connectDB } from "./lib/db.js";
const userRegister = async () => {
 connectDB();
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = new User({
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
      role: "admin",
    });
    const savedUser = await user.save();
    console.log("User registered:", savedUser);
  } catch (error) {
    console.error("Error registering user:", error);
  }
};
userRegister();