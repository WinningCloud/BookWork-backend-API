import express from 'express';
import User from '../models/User.js';
const router = express.Router(); 
import jwt from "jsonwebtoken"

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },   
    process.env.JWT_SECRET,
    { expiresIn: "15d" }
  );
};


router.post("/register", async (req, res) => {
    try{
        const {email, password, username} = req.body;
        console.log(email, password, username);
        if(!email || !password || !username){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }

        //check if user already exists

        const existingUsername = await User.findOne( {username});
        if(existingUsername){
            return res.status(400).json({message: "User already exists with this username"});
        }

        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({message: "User already exists with this email"});
        }

         //get random avatar
        const profileImage = `https://avatar.iran.liara.run/username?username=${username}`;

        

        const user = new User({
            email,
            username, 
            password,
            profileImage,
        })

        await user.save();


        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: new Date(),
            }
        })


       



       


    }catch(error){
        console.log("Error in register route ",error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


router.post("/login", async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message:"All fields are required"
            })
        }

        //check if user exist
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: "User does not exist"})

        //check if user exist
        const isPasswordCorrect = await user.comparePassword(password);
        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid credentials"});

        const token = generateToken(user._id);
        res.status(200).json({
            token,
            user:{
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: new Date(),
            }
        });
    }catch(err){
        console.log("Error in login route", err);
        res.status(500).json({message:"Internal server error"});
    }
});


export default router;