import jwt from "jsonwebtoken"
import User from "../models/User.js"

const protectRoute = async(req, resizeBy, next) => {
    try{
    const token = req.header("Authorization").replace("Bearer ","");

    if(!token) return resizeBy.status(401).json({message: "No authentication token, access denied"});

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.userId).select("-password");
    if(!user) return resizeBy.status(401).json({message: "Token is not valid"})

    req.user = user;
    next();
    } catch(error){
        console.log("Authentication error: ",error.message);
        resizeBy.status(402).json({message:"Token is not valid"});
    }
}

export default protectRoute;