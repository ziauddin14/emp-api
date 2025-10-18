import express from "express"
import helmet from "helmet"
import cors from 'cors'
import {errorMiddleware} from "./middlewares/error.js"
import morgan from "morgan"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import authRoutes from "./routes/auth.js"
import departmentRouter from './routes/department.js'
import employeeRouter from './routes/employee.js'
import salaryRouter from './routes/salary.js'
import leaveRouter from './routes/leave.js'
import settingRouter from './routes/setting.js'
import dashboardROuter from './routes/dashboard.js'
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dtwwqrywm",
  api_key: "189349552473758",
  api_secret: "fy6CsKr9WUkl_5MBF1eBEU7jlec",
});

  dotenv.config({path: './.env',});
  
  export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
  const port = process.env.PORT;

const mongoURI = process.env.MONGO_URI;

connectDB(mongoURI);
  
  const app = express();
  
                                
  
  
app.use(
  helmet({
    contentSecurityPolicy: envMode !== "DEVELOPMENT",
    crossOriginEmbedderPolicy: envMode !== "DEVELOPMENT",
  })
);
    
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({origin:' * ',credentials:true}));
app.use(morgan('dev'))
    

  // your routes here
  app.use('/api/auth', authRoutes);
  app.use('/api/department', departmentRouter);
  app.use('/api/employee', employeeRouter);
  app.use('/api/salary', salaryRouter);
  app.use('/api/leave', leaveRouter);
  app.use('/api/setting', settingRouter);
  app.use('/api/dashboard' , dashboardROuter)


    
  app.get("/", (req, res) => {
    res.status(404).json({
      success: false,
      message: "Page not found",
    });
  });
  
  app.use(errorMiddleware);
    
  app.listen(port, () => console.log('Server is working on Port:'+port+' in '+envMode+' Mode.'));
  