const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["ADMIN", "RECEPTIONIST"],
    required: true,
  },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("User", userSchema);
