const teamSchema = require("../Schemas/teamSchema");



class teamModel {
  async addTeam(data) {
    let { captain, tm2, tm3, tm4 } = data
    let teamDb = new teamSchema({
      captain: captain,
      tm2: tm2,
      tm3: tm3,
      tm4: tm4
    })
    try {
      let response = await teamDb.save()
      return {
        message: "Team Added Successfully",
        data : response
      }
    } catch (error) {
      return error.message
    }
    
  }

  async checkIfAnyPlayerExists(data) {
    let { captain, tm2, tm3, tm4 } = data

    try {
      let response = await teamSchema.findOne({
        $or: [
          { "captain.id": captain.id },
          { "tm2.id": tm2.id },
          { "tm3.id": tm3.id },
          { "tm4.id": tm4.id }
        ]
      })
      // console.log(response)
      if (response) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      return false
    }
  }
}

module.exports = teamModel;