import express from "express";
import cloudinary from "../lib/cloudinary.js"
import protectRoute from "../middleware/auth.middleware.js";
import Book from "../models/Book.js"

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try{
        
        const {title, caption, rating, image} = req.body;

        if(!image || !title || !caption || !rating){
            return res.status(400).json({message: "Please provide all fields"})
        }
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        })

        await newBook.save();
        res.status(201).json(newBook)

    } catch(err){
        console.log("Error in creating book",err);
    }
})


//pagination => infinite loading
router.get("/", protectRoute, async(req, res) => {
    try{
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find().sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        .populate("user","username profileImage");
        const totalBooks = await Book.countDocuments();
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    }catch(error){
        console.log("Error in getting all books route ", error)
        res.status(500).json({message: "Internal server error."})
    }
} )


router.delete("/:id", protectRoute, async(req, res)=>{
    try{
        //check if book exists
        const book = await Book.findById(req.params.id);
        if(!book) return res.status(404).json({message: "Book not found"});

        //check if we are the owner of the book
        if(book.user.toString() !== req.user._id.toString()){
            return res.status(401).json({message: "Unauthorized"});
        }

        //delete image from cloudinary as well

        if(book.image && book.image.includes("cloudinary")){
            try{
                const publicId = book.image.split("/").pop().split(".")[0];
            } catch(deleteErr){
                console.log("Error deleting cloudinary book image: ",deleteErr);
            }
        }

        await book.deleteOne();
        res.json({message: "Book deleted successfully"});
    }catch(err){
        console.log("Error deleting book ", err);
        res.status(401).json({message: "Couldn't delete book"})

    }
})


router.get("/user", protectRoute, async(req, res)=>{
    try{
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.json(books);

    }catch(err){
        console.log("Error showing books ", err)
        res.status(500).json({message: "Server error"})
    }
})





export default router;