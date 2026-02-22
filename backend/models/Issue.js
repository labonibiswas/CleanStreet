const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model("Issue", issueSchema);