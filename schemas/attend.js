const mongoose = require("mongoose");

const attendSchema = new mongoose.Schema({
  discordID: String,
  date: Number,
  timePutIn: {
    type: Number,
    default: 0,
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
  logs: {
    type: Array,
    default: [{ checkedIn: Number, checkedOut: Number }],
  },
  lastReminder: Number,
});

module.exports = mongoose.model("Attendance", attendSchema);
