const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    personToVisit: {
      type: String,
      required: true,
    },
    unitNumber: {
      type: String,
      required: true,
    },
    unitBuilding: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CHECKED_IN", "CHECKED_OUT"],
      default: "PENDING",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    checkInAt: {
      type: Date,
    },
    checkOutAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
