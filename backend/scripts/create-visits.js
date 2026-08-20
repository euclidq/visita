require("dotenv").config();

const mongoose = require("mongoose");
const Visit = require("../models/visit.model");

const firstNames = ["Alex", "Bianca", "Carlo", "Diana", "Enzo"];
const lastNames = ["Santos", "Reyes", "Cruz", "Garcia"];
const hosts = ["John Doe", "Maria Santos", "David Lee", "Anna Cruz"];
const purposes = ["Meeting", "Delivery", "Interview", "Maintenance"];
const buildings = ["Building A", "Building B"];

const referenceNumberStart = Date.now();
const now = Date.now();
const visits = Array.from({ length: 20 }, (_, index) => {
  const visit = {
    referenceNumber: `VISIT-${referenceNumberStart + index}`,
    firstName: index === 0 ? "Euclid" : firstNames[index % firstNames.length],
    lastName: index === 0 ? "Quemada" : lastNames[index % lastNames.length],
    emailAddress: "euclidlquemada@gmail.com",
    mobileNumber: `0917${String(index + 1).padStart(7, "0")}`,
    purpose: purposes[index % purposes.length],
    personToVisit: hosts[index % hosts.length],
    unitNumber: `Unit ${101 + index}`,
    unitBuilding: buildings[index % buildings.length],
    status: index >= 15 ? "APPROVED" : "PENDING",
  };

  if (index === 18) {
    visit.status = "CHECKED_IN";
    visit.checkInAt = new Date(now - 30 * 60 * 1000);
  }
  if (index === 19) {
    visit.status = "CHECKED_OUT";
    visit.checkInAt = new Date(now - 2 * 60 * 60 * 1000);
    visit.checkOutAt = new Date(now - 60 * 60 * 1000);
  }

  return visit;
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    await Visit.insertMany(visits);
    console.log("20 visitor registrations created");
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
