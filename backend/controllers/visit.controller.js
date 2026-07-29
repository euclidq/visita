const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { generateReferenceNumber } = require("../utils/helpers");
const Visit = require("../models/visit.model");
const {
  consumeOtp,
  consumeVerificationToken,
} = require("./otp.controller");
const mailer = require("../config/mailer");
const QRCode = require("qrcode");

const EMAIL_LOGO_CID = "visita-logo@visita";
const EMAIL_LOGO_PATH = path.join(
  __dirname,
  "../assets/visita_horizontal_blue.png",
);
const REGISTRATION_REQUIRED_FIELDS = {
  firstName: "First name",
  lastName: "Last name",
  emailAddress: "Email address",
  mobileNumber: "Mobile number",
  purpose: "Purpose",
  personToVisit: "Person to visit",
  unitNumber: "Unit number",
  unitBuilding: "Building",
};
const TRACK_REQUIRED_FIELDS = {
  referenceNumber: "Reference number",
  emailAddress: "Email address",
  otp: "OTP",
};

const renderVisitConfirmationEmail = async ({ referenceNumber, qrCodeCid }) => {
  const templatePath = path.join(
    __dirname,
    "../templates/registration-confirmation.html",
  );
  const template = await readFile(templatePath, "utf8");

  return template
    .replaceAll("{{referenceNumber}}", referenceNumber)
    .replaceAll("{{qrCodeCid}}", qrCodeCid)
    .replaceAll("{{logoCid}}", EMAIL_LOGO_CID);
};

// Create a new visit
const createVisit = async (req, res) => {
  try {
    const referenceNumber = generateReferenceNumber();
    req.body.referenceNumber = referenceNumber;

    const visit = await Visit.create(req.body);

    const emailAddress = req.body.emailAddress?.trim().toLowerCase();
    if (emailAddress) {
      const qrCode = await QRCode.toBuffer(referenceNumber, {
        errorCorrectionLevel: "H",
        margin: 2,
        type: "png",
        width: 320,
      });
      const qrCodeCid = `visit-${referenceNumber}@visita`;
      const emailHtml = await renderVisitConfirmationEmail({
        referenceNumber,
        qrCodeCid,
      });

      await mailer.sendMail({
        from: `"Visitor Management System" <${process.env.GOOGLE_EMAIL}>`,
        to: emailAddress,
        subject: "Registration Confirmation",
        html: emailHtml,
        attachments: [
          {
            filename: "visita-horizontal-blue.png",
            path: EMAIL_LOGO_PATH,
            contentType: "image/png",
            cid: EMAIL_LOGO_CID,
          },
          {
            filename: `visit-${referenceNumber}.png`,
            content: qrCode,
            contentType: "image/png",
            cid: qrCodeCid,
          },
        ],
      });
    }

    res.status(201).json({
      title: "Visit Created",
      message: "Visit submitted successfully",
      data: visit,
    });
  } catch (error) {
    res.status(400).json({
      title: "Visit Creation Failed",
      message: error.message,
    });
  }
};

const registerVisit = async (req, res) => {
  const missingField = Object.entries(REGISTRATION_REQUIRED_FIELDS).find(
    ([field]) => !req.body[field]?.toString().trim(),
  );

  if (missingField) {
    return res.status(400).json({
      title: "Registration Failed",
      message: `${missingField[1]} is required`,
    });
  }

  const emailAddress = req.body.emailAddress?.trim().toLowerCase();
  const verificationToken = req.body.verificationToken?.toString();

  if (!consumeVerificationToken(emailAddress, verificationToken)) {
    return res.status(403).json({
      title: "Email Not Verified",
      message: "Verify the email address before registering",
    });
  }

  try {
    const referenceNumber = generateReferenceNumber();
    const visitData = { ...req.body };
    delete visitData.verificationToken;
    visitData.emailAddress = emailAddress;
    visitData.referenceNumber = referenceNumber;

    const visit = await Visit.create(visitData);

    if (emailAddress) {
      const qrCode = await QRCode.toBuffer(referenceNumber, {
        errorCorrectionLevel: "H",
        margin: 2,
        type: "png",
        width: 320,
      });
      const qrCodeCid = `visit-${referenceNumber}@visita`;
      const emailHtml = await renderVisitConfirmationEmail({
        referenceNumber,
        qrCodeCid,
      });

      if (process.env.NODE_ENV !== "testing") {
        await mailer.sendMail({
          from: `"Visitor Management System" <${process.env.GOOGLE_EMAIL}>`,
          to: emailAddress,
          subject: "Registration Confirmation",
          html: emailHtml,
          attachments: [
            {
              filename: "visita-horizontal-blue.png",
              path: EMAIL_LOGO_PATH,
              contentType: "image/png",
              cid: EMAIL_LOGO_CID,
            },
            {
              filename: `visit-${referenceNumber}.png`,
              content: qrCode,
              contentType: "image/png",
              cid: qrCodeCid,
            },
          ],
        });
      }
    }

    res.status(201).json({
      title: "Registration Successful",
      message: "Visit submitted successfully",
      data: visit,
    });
  } catch (error) {
    res.status(400).json({
      title: "Registration Failed",
      message: error.message,
    });
  }
};

// Track a visit after verifying the email OTP
const trackVisit = async (req, res) => {
  const missingField = Object.entries(TRACK_REQUIRED_FIELDS).find(
    ([field]) => !req.body[field]?.toString().trim(),
  );

  if (missingField) {
    return res.status(400).json({
      title: "Visit Tracking Failed",
      message: `${missingField[1]} is required`,
    });
  }

  const referenceNumber = req.body.referenceNumber?.trim();
  const emailAddress = req.body.emailAddress?.trim().toLowerCase();
  const otp = req.body.otp?.toString().trim();

  const otpResult = consumeOtp(emailAddress, otp);

  if (otpResult === 'invalid') {
    return res.status(401).json({
      title: "Invalid OTP",
      message: "OTP is invalid or has already been used"
    });
  } else if (otpResult === 'expired') {
    return res.status(401).json({
      title: "Expired OTP",
      message: "OTP has expired. Please request a new one"
    });
  }

  try {
    const visit = await Visit.findOne({
      referenceNumber,
      emailAddress,
    }).collation({
      locale: "en",
      strength: 2,
    });

    if (!visit) {
      return res.status(404).json({
        title: "Visit Not Found",
        message: "No visit found with the provided reference number and email address",
      });
    }

    res.status(200).json({
      title: "Visit Found",
      message: "Visit retrieved successfully",
      data: visit,
    });
  } catch (error) {
    res.status(400).json({
      title: "Visit Tracking Failed",
      message: error.message,
    });
  }
};

const listVisits = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const sortFields = ["referenceNumber", "firstName", "emailAddress", "personToVisit", "unitBuilding", "status", "createdAt"];
  const sortField = sortFields.includes(req.query.sortField) ? req.query.sortField : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.search?.trim()) {
    const search = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { referenceNumber: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { emailAddress: { $regex: search, $options: "i" } },
    ];
  }

  try {
    const [visits, total] = await Promise.all([
      Visit.find(query)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Visit.countDocuments(query),
    ]);

    res.json({
      data: visits,
      pagination: { page, limit, total },
    });
  } catch (error) {
    res.status(500).json({
      title: "Unable to Load Registrations",
      message: error.message,
    });
  }
};

const getVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.visitId).lean();

    if (!visit) {
      return res.status(404).json({
        title: "Registration Not Found",
        message: "Visitor registration was not found",
      });
    }

    res.json({ data: visit });
  } catch (error) {
    res.status(error.name === "CastError" ? 404 : 500).json({
      title: "Registration Not Found",
      message: error.name === "CastError"
        ? "Visitor registration was not found"
        : error.message,
    });
  }
};

module.exports = {
  createVisit,
  registerVisit,
  trackVisit,
  listVisits,
  getVisit,
};
