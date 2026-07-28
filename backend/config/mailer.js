const nodemailer = require("nodemailer");

const requiredVariables = [
  "GOOGLE_EMAIL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
];

const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length) {
  throw new Error(`Missing mail environment variables: ${missingVariables.join(", ")}`);
}

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_EMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

module.exports = mailer;
