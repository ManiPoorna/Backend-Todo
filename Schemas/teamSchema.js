const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamMemberSchema = new Schema({
  name: String,
  id: String
});

const teamModel = new Schema({
  captain: teamMemberSchema,
  tm2: teamMemberSchema,
  tm3: teamMemberSchema,
  tm4: teamMemberSchema
});

const teamSchema = mongoose.model('team', teamModel)

module.exports = teamSchema