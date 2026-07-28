const crypto = require("node:crypto");

const generateReferenceNumber = () => {
  const timestamp = Date.now();
  return `VISIT-${timestamp}`;
}

const generateOtp = () => {
  if (process.env.NODE_ENV === "testing") {
    return process.env.TEST_OTP || "123456";
  }

  return crypto.randomInt(100000, 1000000).toString();
};

module.exports = { generateOtp, generateReferenceNumber };
