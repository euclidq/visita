const { readFile } = require("node:fs/promises");
const { createHash, randomBytes } = require("node:crypto");
const path = require("node:path");
const mailer = require("../config/mailer");
const { generateOtp } = require("../utils/helpers");

const otpStore = new Map();
const verificationStore = new Map();
const OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const OTP_RESEND_INTERVAL_SECONDS = parseInt(process.env.OTP_RESEND_INTERVAL_SECONDS, 10);
const EMAIL_LOGO_CID = "visita-logo@visita";
const EMAIL_LOGO_PATH = path.join(
  __dirname,
  "../assets/visita_horizontal_white.png",
);

const renderOtpEmail = async (otp) => {
  const templatePath = path.join(__dirname, "../templates/otp.html");
  const template = await readFile(templatePath, "utf8");

  return template
    .replaceAll("{{otp}}", otp)
    .replaceAll("{{expiryMinutes}}", OTP_EXPIRY_MINUTES.toString())
    .replaceAll("{{logoCid}}", EMAIL_LOGO_CID);
};

const sendOtp = async (req, res) => {
  const emailAddress = req.body.emailAddress?.trim().toLowerCase();

  if (!emailAddress || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
    return res.status(400).json({
      title: "OTP Sending Failed",
      message: "A valid email address is required",
    });
  }

  try {
    const otp = generateOtp();
    const emailHtml = await renderOtpEmail(otp);

    if (process.env.NODE_ENV !== "testing") {
      await mailer.sendMail({
        from: `"Visita" <${process.env.GOOGLE_EMAIL}>`,
        to: emailAddress,
        subject: "Your verification code",
        text: `Your verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        html: emailHtml,
        attachments: [
          {
            filename: "visita-horizontal-white.png",
            path: EMAIL_LOGO_PATH,
            contentType: "image/png",
            cid: EMAIL_LOGO_CID,
          },
        ],
      });
    }

    otpStore.set(emailAddress, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    res.status(200).json({
      title: "OTP Sent",
      message: "OTP has been sent to the email address",
      interval: OTP_RESEND_INTERVAL_SECONDS,
    });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({
      title: "OTP Sending Failed",
      message: "Failed to send OTP"
    });
  }
};

const verifyOtp = (req, res) => {
  const emailAddress = req.body.emailAddress?.trim().toLowerCase();
  const otp = req.body.otp?.toString().trim();

  const otpResult = consumeOtp(emailAddress, otp);

  if (otpResult === 'invalid') {
    return res.status(401).json({
      title: "Invalid OTP",
      message: "OTP is invalid. Please check the OTP and try again"
    });
  } else if (otpResult === 'expired') {
    return res.status(401).json({
      title: "Expired OTP",
      message: "OTP has expired. Please request a new one"
    });
  }

  const verificationToken = randomBytes(32).toString("hex");
  verificationStore.set(emailAddress, {
    tokenHash: createHash("sha256").update(verificationToken).digest("hex"),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });

  res.status(200).json({
    title: "OTP Verified Successfully",
    message: "OTP has been verified successfully",
    verificationToken,
  });
};

const consumeOtp = (emailAddress, otp) => {
  const storedOtp = otpStore.get(emailAddress);

  if (!storedOtp || storedOtp.otp !== otp) {
    if (storedOtp?.expiresAt < Date.now()) {
      otpStore.delete(emailAddress);
    }
    return 'invalid';
  }

  if (storedOtp.expiresAt < Date.now()) {
    otpStore.delete(emailAddress);
    return 'expired';
  }

  otpStore.delete(emailAddress);
  return true;
};

const consumeVerificationToken = (emailAddress, verificationToken) => {
  const verification = verificationStore.get(emailAddress);
  const tokenHash = verificationToken
    ? createHash("sha256").update(verificationToken).digest("hex")
    : "";

  if (
    !verification ||
    verification.expiresAt < Date.now() ||
    verification.tokenHash !== tokenHash
  ) {
    if (verification?.expiresAt < Date.now()) {
      verificationStore.delete(emailAddress);
    }
    return false;
  }

  verificationStore.delete(emailAddress);
  return true;
};

module.exports = {
  sendOtp,
  verifyOtp,
  consumeOtp,
  consumeVerificationToken,
};
