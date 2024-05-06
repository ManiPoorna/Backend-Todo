const express = require('express');
const dashboardRouter = express.Router();
const dashboardModel = require('../Models/dashboardModel.js');

dashboardRouter.get('/get-registered-teams', async (req, res) => {
 
  const DashboardModel = new dashboardModel();
  try {
    let teams = await DashboardModel.getRegisteredTeams();
    return res.status(200).send({
      status : 200,
      totalTeams: teams.length,
      registeredTeams: teams,
    });
  }
  catch (err) {
    return res.status(500).send({
      err: err.message,
      status: 500,
    });
  }
});


module.exports = dashboardRouter;