const express = require('express');
const confirmationRouter = express.Router();
const confirmationModel = require("../Models/confirmationModel")

confirmationRouter.post("/get-confirmation", async (req, res) => {
  let ConfirmationModel = new confirmationModel();
  let data = req.body
  try {
    let response = await ConfirmationModel.sendConfirmationRequest(data);
    return res.status(201).send({
      message: "Confirmation request sent successfully",
      status : 201,
    })
  } catch (error) {
    return res.status(200).send({
      error,
      status :500,
    })
  }
})

confirmationRouter.get("/get-confirmation-requests", async (req, res) => { 
  let ConfirmationModel = new confirmationModel();
  try {
    let response = await ConfirmationModel.getConfirmationRequests();
    return res.status(200).send({
      message: "Requests fetched successfully",
      requests : response,
      status : 200,
    })
  } catch (error) {
    return res.status(200).send({
      error,
      status :500,
    })
  }
})

module.exports = confirmationRouter