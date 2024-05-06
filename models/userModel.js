const userSchema = require("../Schemas/userSchema")

class userModel{


  async addUser(userData) {
    let userDb = new userSchema({
      name: userData.name,
      email: userData.email,
      password: userData.password,  
    })

    try {
      let response = await userDb.save();
      return "Account created successfully"
    } catch (error) {
      return {
        error,
        messsage : "Something went wrong, please try again"
      }
    }
  }


  async checkIfUserExists(userData) {
    try {
      let userDb = await userSchema.findOne({ email: userData.email })
      if (userDb) {
        return true
      }
      else {
        return false
      }
    } catch (error) {
      return error
    }
  }


  async loginUser(userData) { 
    try {
      let userDb = await userSchema.findOne({ email: userData.email });
      if (userDb) { 
        if (userDb.password === userData.password) {
          return {
            message: "Login successful",
            status: 200
          }
        }
        else {
          return {
            message: "Incorrect password",
            status: 500,
          }
        }
      }
      else {
        return { message: "User not found", status: 404 }
      }
    } catch (error) {
      return {
        message: "Something went wrong",
        error
      }
    }
  }
}

module.exports = userModel