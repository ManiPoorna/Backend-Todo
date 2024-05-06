const teamSchema = require("../Schemas/teamSchema")


class dashboardModel{

  // funtion to get all registered teams from db
  async getRegisteredTeams() {
    try {
      const teams = await teamSchema.find({})
      if (teams) {
        return teams;
      }
      else {
        return null
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

module.exports = dashboardModel