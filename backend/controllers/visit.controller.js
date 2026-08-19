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
  "../assets/visita_horizontal_white.png",
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
const STATUS_NOTIFICATION_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/status-notification.html",
);
const TRACK_REQUIRED_FIELDS = {
  referenceNumber: "Reference number",
  emailAddress: "Email address",
  otp: "OTP",
};
const VISIT_TABLE_FIELDS = [
  "referenceNumber",
  "status",
  "firstName",
  "lastName",
  "personToVisit",
  "unitNumber",
  "unitBuilding",
  "createdAt",
].join(" ");

const renderVisitConfirmationEmail = async ({ referenceNumber }) => {
  const templatePath = path.join(
    __dirname,
    "../templates/registration-confirmation.html",
  );
  const template = await readFile(templatePath, "utf8");

  return template
    .replaceAll("{{referenceNumber}}", referenceNumber)
    .replaceAll("{{logoCid}}", EMAIL_LOGO_CID);
};

const escapeHtml = (value) => String(value ?? "").replace(
  /[&<>"']/g,
  (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character],
);

const renderVisitStatusEmail = async (visit, qrCodeCid) => {
  const template = await readFile(STATUS_NOTIFICATION_TEMPLATE_PATH, "utf8");
  const isApproved = visit.status === "APPROVED";
  const heading = `Your registration has been ${isApproved ? "approved" : "rejected"}`;
  const subtitle = isApproved
    ? "Please keep your reference number for your visit."
    : "Please review the rejection reason below for more information.";
  const rejectionReasonSection = visit.rejectionReason
    ? `<div style="margin-top: 16px"><span style="display: block; margin-bottom: 4px; color: #4b5563">Rejection reason</span><strong style="display: block; font-size: 18px">${escapeHtml(visit.rejectionReason)}</strong></div>`
    : "";
  const qrCodeSection = isApproved
    ? `<img src="cid:${qrCodeCid}" alt="QR code containing the registration reference number" width="320" style="display: block; width: 100%; max-width: 320px; height: auto; margin: 24px auto 0" /><p style="margin: 24px 0 0; color: #4b5563">Present this QR code before check-in.</p>`
    : "";

  return template
    .replaceAll("{{logoCid}}", EMAIL_LOGO_CID)
    .replaceAll("{{heading}}", heading)
    .replaceAll("{{subtitle}}", subtitle)
    .replaceAll("{{referenceNumber}}", escapeHtml(visit.referenceNumber))
    .replaceAll("{{visitorName}}", escapeHtml(`${visit.firstName} ${visit.lastName}`))
    .replaceAll("{{rejectionReasonSection}}", rejectionReasonSection)
    .replaceAll("{{qrCodeSection}}", qrCodeSection);
};

// Create a new visit
const createVisit = async (req, res) => {
  try {
    const referenceNumber = generateReferenceNumber();
    req.body.referenceNumber = referenceNumber;

    const visit = await Visit.create(req.body);

    const emailAddress = req.body.emailAddress?.trim().toLowerCase();
    if (emailAddress) {
      const emailHtml = await renderVisitConfirmationEmail({
        referenceNumber,
      });

      await mailer.sendMail({
        from: `"Visita" <${process.env.GOOGLE_EMAIL}>`,
        to: emailAddress,
        subject: "Registration Confirmation",
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
      const emailHtml = await renderVisitConfirmationEmail({
        referenceNumber,
      });

      if (process.env.NODE_ENV !== "testing") {
        await mailer.sendMail({
          from: `"Visita" <${process.env.GOOGLE_EMAIL}>`,
          to: emailAddress,
          subject: "Registration Confirmation",
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
  const sortFields = [
    "referenceNumber",
    "status",
    "firstName",
    "personToVisit",
    "unitBuilding",
    "createdAt",
  ];
  const sortField = sortFields.includes(req.query.sortField) ? req.query.sortField : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.search?.trim()) {
    const searchTerms = req.query.search
      .trim()
      .split(/\s+/)
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    query.$and = searchTerms.map((term) => ({
      $or: [
        { referenceNumber: { $regex: term, $options: "i" } },
        { firstName: { $regex: term, $options: "i" } },
        { lastName: { $regex: term, $options: "i" } }
      ],
    }));
  }

  try {
    const [visits, total] = await Promise.all([
      Visit.find(query)
        .select(VISIT_TABLE_FIELDS)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Visit.countDocuments(query),
    ]);

    res.json({
      title: "Visitor Registrations Fetched",
      message: "Visitor registrations were fetched successfully",
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

    res.json({
      title: "Visitor Registration Fetched",
      message: "Visitor registration was fetched successfully",
      data: visit
    });
  } catch (error) {
    res.status(error.name === "CastError" ? 404 : 500).json({
      title: "Registration Not Found",
      message: error.name === "CastError"
        ? "Visitor registration was not found"
        : error.message,
    });
  }
};

const updateVisitStatus = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      title: "Status Update Failed",
      message: "Only administrators can update a visit status",
    });
  }

  const status = req.body.status?.toString().trim().toUpperCase();
  const rejectionReason = req.body.rejectionReason?.toString().trim();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({
      title: "Status Update Failed",
      message: "Status must be APPROVED or REJECTED",
    });
  }

  if (status === "REJECTED" && !rejectionReason) {
    return res.status(400).json({
      title: "Status Update Failed",
      message: "Rejection reason is required",
    });
  }

  try {
    const visit = await Visit.findById(req.params.visitId);

    if (!visit) {
      return res.status(404).json({
        title: "Registration Not Found",
        message: "Visitor registration was not found",
      });
    }

    if (visit.status !== "PENDING") {
      return res.status(400).json({
        title: "Status Update Failed",
        message: "Only pending visitor registrations can be updated",
      });
    }

    visit.status = status;
    visit.rejectionReason = status === "REJECTED" ? rejectionReason : undefined;
    await visit.save();

    if (process.env.NODE_ENV !== "testing") {
      const attachments = [{
        filename: "visita-horizontal-white.png",
        path: EMAIL_LOGO_PATH,
        contentType: "image/png",
        cid: EMAIL_LOGO_CID,
      }];
      let qrCodeCid;

      if (status === "APPROVED") {
        qrCodeCid = `visit-${visit.referenceNumber}@visita`;
        attachments.push({
          filename: `visit-${visit.referenceNumber}.png`,
          content: await QRCode.toBuffer(visit.referenceNumber, {
            errorCorrectionLevel: "H",
            margin: 2,
            type: "png",
            width: 320,
          }),
          contentType: "image/png",
          cid: qrCodeCid,
        });
      }

      const emailHtml = await renderVisitStatusEmail(visit, qrCodeCid);
      await mailer.sendMail({
        from: `"Visita" <${process.env.GOOGLE_EMAIL}>`,
        to: visit.emailAddress,
        subject: `Visit Request ${status === "APPROVED" ? "Approved" : "Rejected"}`,
        html: emailHtml,
        attachments,
      });
    }

    res.json({
      title: `Visit ${status === "APPROVED" ? "Approved" : "Rejected"}`,
      message: `Visitor registration was ${status.toLowerCase()} successfully`,
      data: visit,
    });
  } catch (error) {
    res.status(error.name === "CastError" ? 404 : 500).json({
      title: error.name === "CastError" ? "Registration Not Found" : "Status Update Failed",
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
  updateVisitStatus,
};
