const express = require("express");
const { loginController, registerController,fetchAllUsersController,userinfo } = require("../Controllers/userController");
const Router = express.Router();

const { protect } = require("../middleware/authMiddleware");

Router.post("/login", loginController);
Router.post("/register", registerController);
Router.get("/fetchUsers",protect, fetchAllUsersController);
Router.get("/", protect,userinfo);
module.exports = Router;
