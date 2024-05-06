const express = require('express');
const teamCreationRouter= express.Router();
const teamModel = require("../Models/teamModel.js");
const teamSchema = require('../Schemas/teamSchema.js');
const confirmationSchema = require("../Schemas/confirmationSchema.js")

let totalTeams = 0;
teamCreationRouter.post("/add-team", async (req, res) => {
  const teamInstance = new teamModel();

  // getting data coming from user
  let data = req.body

  // Checking if someone alrady registered or not
  let checkIfPlayerExists = await teamInstance.checkIfAnyPlayerExists(data)

  //  proceed with the creation of team if no member is registerd with another team
  if (!checkIfPlayerExists) {
    // funciton handles the team creation
    if (totalTeams <= 25) {
      let response = await teamInstance.addTeam(data)
      totalTeams += 1;
      return res.status(201).send({
        message: response.message,
        totalTeamsRegistered: totalTeams,
        status: 201,
      })
    }
    return res.status(200).send({
      message: "No More Registrations available for now..",
      status : 409,
    })
  }
  // if user is already registered we will through message of aready exists
  else {
    return res.status(200).send({
      message: "Someone in your team already registered with another Team",
      status : 500,
    })
  }
});

teamCreationRouter.delete("/delete-db-data", async(req, res) => {
  try {
    let teamsResponse = await teamSchema.deleteMany({});
    let confirmationResponse = await confirmationSchema.deleteMany({});
    return res.status(202).send({
      message: {
        confirmationResponse,
        teamsResponse,
      },
      status: 202,
    })
  } catch (error) {
    return res.status(202).send({
      message: error.message,
      status: 500,
    })
  }
})

module.exports = teamCreationRouter