// Milestone 1

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
// Middlewares
import { ipBlockWAF } from "./Middleware/WAF.js";
// import authMiddle from "./Middleware/authMiddle.js"
// Routes
import authRoutes from "./Routes/authRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import securityRoutes from "./Routes/securityRoutes.js"

dotenv.config(); //loads env files and allows safe use process.env.VARIABLE

const app = express();

// middlewares
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173", //frontend origin (localhost)
      "https://waf-jwt-frontend.vercel.app", //frontend origin 
      "http://localhost:5174" //Security dashboard origin (localhost)
    ],
    credentials: true
  })
);
app.set("trust proxy", 1)
// Database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo Db connected"))
  .catch((err) => console.log("Mongo Db not connected", err));
app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({extended:true}))
// WAF 

  app.use(ipBlockWAF);


// cookie parser
app.use(cookieParser());
// Public authentication route
app.use("/api/auth", authRoutes);
// Protected user routes witj JWT
// app.use("/api/users", authMiddle, userRoutes);
// route for security monitor dashboard
app.use("/api/security",securityRoutes)

// quick health check route
app.get("/health",(req,res)=>res.json({ok:true}))
console.log("MONGO_URL:", process.env.MONGO_URL);



// Test route
app.get("/", (req, res) => {
  res.send("Hello world");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Milestone 1 completed

// Milestone 2
