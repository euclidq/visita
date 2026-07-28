const mongoose = require("mongoose");

const connectMongoDb = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in the environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectMongoDb;