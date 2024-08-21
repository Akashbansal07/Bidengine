const express = require("express");
const UserModel = require("../models/userModel")
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");


const loginController = expressAsyncHandler(async (req, res) => {

    const { name, password } = req.body;

    const user = await UserModel.findOne({ name });



    if (user && (await user.matchPassword(password))) {
        const response = ({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
        console.log(response);
        res.json(response);
    } else {
        throw new Error("Invalid userName or Password")
    }
});



const registerController = expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    //check for all fields
    if (!name || !email || !password) {
        res.send(400);
        throw Error("All input fields are necessary");
    }

    //pre-existing-user
    const userExist = await UserModel.findOne({ email });
    if (userExist) {
        throw new Error("User already Exists");
    }

    //userName alreday  taken
    const userNameExist = await UserModel.findOne({ name });
    if (userNameExist) {
        throw new Error("UserName already Exists please change");
    }

    //create a new user entry in DB
    const user = await UserModel.create({ name, email, password });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    }
    else {
        res.status(400)
        throw new Error("Registration Error")
    }
});




const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } }
            ],
        }
        : {};

        const users = await UserModel.find(keyword);

        // Filter out the current user (assuming req.user._id is the current user's ID)
        const filteredUsers = users.filter(user => user._id.toString() !== req.user._id.toString());
    
        // Send the filtered users as the response
        res.send(filteredUsers);
})

const userinfo = expressAsyncHandler(async (req, res) => {
    try {
        // Assuming you have a userId stored in the req object from a middleware that verifies the JWT token
        const userId = req.user._id;

        // Fetch the user information from the database
        const user = await UserModel.findById(userId).select("-password"); // Exclude password from the returned data

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


module.exports = { loginController, registerController, fetchAllUsersController ,userinfo};