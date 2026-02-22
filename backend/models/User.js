const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
     location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
},

    role: {
      type: String,
      enum: ["citizen", "volunteer", "admin"],
      required: true
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);