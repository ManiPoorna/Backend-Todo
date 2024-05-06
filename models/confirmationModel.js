const paymentApprovalSchema = require("../Schemas/confirmationSchema");

class confirmationModel{

  // function to send confirmation request 
  async sendConfirmationRequest(userData) {
    try {
      let userDb = new paymentApprovalSchema({
        name: userData.name,
        mobile: userData.mobile,
        isApproved: false,
      })
      let response = await userDb.save();
      return response;
    } catch (error) {
      return error
    }
  }


  async getConfirmationRequests() {
    try {
      let requests = await paymentApprovalSchema.find({});
      if (requests) {
        return requests;
      }
    } catch (error) {
      return error
    }
  }
}

module.exports = confirmationModel