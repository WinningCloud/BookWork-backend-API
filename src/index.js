import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import {connectDB} from "./lib/db.js";
import bookRoutes from "./routes/bookRoutes.js"
import cors from "cors"

const app = express();
app.use(cors());
dotenv.config();

const PORT = process.env.PORT || 5000;
app.use(express.json());

console.log(process.env.PORT);

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes)





connectDB();
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
    
})



