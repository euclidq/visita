require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user.model");

const [firstName, lastName, emailAddress, password, role = "ADMIN"] =
  process.argv.slice(2);

if (!firstName || !lastName || !emailAddress || !password) {
  console.error(
    "Usage: npm run create-user -- <firstName> <lastName> <email> <password> [ADMIN|RECEPTIONIST]",
  );
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    await User.create({
      firstName,
      lastName,
      emailAddress,
      password: await bcrypt.hash(password, 12),
      role,
    });
    console.log("User created");
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
