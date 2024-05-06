const express = require('express');
const userRouter = express.Router();
const userModel = require("../Models/userModel.js");
const UserModel = new userModel();

userRouter.post("/create-account", async (req, res) => {
  let data = req.body
  try {
    // Check if the user already exists
    let response = await UserModel.checkIfUserExists(data);
    // if not exist, create a new account
    if (!response) {
      let response = UserModel.addUser(data);
      return res.status(201).send({
        message: "Account Created Successfully",
        status : 201,
      })
    }
    else {
      return res.status(200).send({
        message: "Account Already Exists",
        status : 500,
      })
    }
  } catch (error) {
    return res.status(500).send({
      error,
      status :500,
    })    
  }
})


userRouter.post("/login", async (req, res) => { 
  let data = req.body
  try {
    let response = await UserModel.loginUser(data);
    return res.status(200).send({
      response: response,
    })
  } catch (error) {
    return res.status(500).send({
      message : error,
      status :500,
    })
  }
})


module.exports = userRouter;