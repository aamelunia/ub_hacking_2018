var mongoose = require("mongoose");

var sessionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  coordinates: { type: Array, required: false },
  users: { type: Number, required: true, default: 1 },
  nicknames: { type: Array },
  messages: {
    type: Array
  }
});

module.exports = mongoose.model("Session", sessionSchema);
