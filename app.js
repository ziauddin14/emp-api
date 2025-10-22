import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "./lib/db.js";
import { errorMiddleware } from "./middlewares/error.js";

import authRoutes from "./routes/auth.js";
import departmentRouter from "./routes/department.js";
import employeeRouter from "./routes/employee.js";
import salaryRouter from "./routes/salary.js";
import leaveRouter from "./routes/leave.js";
import settingRouter from "./routes/setting.js";
import dashboardROuter from "./routes/dashboard.js";

// 🔹 Load environment variables first
dotenv.config({ path: "./.env" });

export const envMode = process.env.NODE_ENV?.trim() || "DEVELOPMENT";
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI;

//  Connect to MongoDB
connectDB(mongoURI);

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dtwwqrywm",
  api_key: "189349552473758",
  api_secret: "fy6CsKr9WUkl_5MBF1eBEU7jlec",
});

const app = express();

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // disable strict CSP (fixes axios fetch blocks)
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

//  Proper CORS setup for Vercel + local dev
const allowedOrigins = [
  "https://emp-frotend.vercel.app/login", // 🔸 replace with your real Vercel frontend domain
  "http://localhost:3000", // for local testing
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/department", departmentRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/setting", settingRouter);
app.use("/api/dashboard", dashboardRouter);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Backend deployed successfully on Railway!",
  });
});

// Error Middleware
app.use(errorMiddleware);

// 🔹 Start Server
app.listen(port, () =>
  console.log(`✅ Server running on port ${port} in ${envMode} mode.`)
);
