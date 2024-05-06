const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const confirmationSchema = new Schema({
    name: String,
    mobile: String,
    isApproved : Boolean
})

const paymentApprovalSchema = mongoose.model('confirmation', confirmationSchema)

module.exports = paymentApprovalSchema