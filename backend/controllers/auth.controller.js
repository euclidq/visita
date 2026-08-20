const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_EXPIRY_MINUTES = parseInt(process.env.JWT_EXPIRY_MINUTES, 10);
const isProduction = process.env.NODE_ENV === "production";
const sessionCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const login = async (req, res) => {
  const emailAddress = req.body.emailAddress?.trim().toLowerCase();
  const password = req.body.password?.toString();

  if (!emailAddress || !password) {
    return res.status(400).json({
      title: "Login Failed",
      message: `${!emailAddress ? "Email address" : "Password"} is required`,
    });
  }

  try {
    const user = await User.findOne({ emailAddress }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        title: "Login Failed",
        message: "Invalid email address or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        title: "Login Failed",
        message: "Your account is inactive",
      });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${JWT_EXPIRY_MINUTES}m` },
    );

    res.cookie("visita-session-cookie", token, {
      ...sessionCookieOptions,
      maxAge: JWT_EXPIRY_MINUTES * 60 * 1000,
    });
    res.json({
      title: "Login Successful",
      message: "Logged in successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      title: "Login Failed",
      message: error.message,
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("visita-session-cookie", sessionCookieOptions);
  res.json({
    title: "Logout Successful",
    message: "Logged out successfully",
  });
};

const me = (req, res) => {
  res.json({
    data: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      emailAddress: req.user.emailAddress,
      role: req.user.role,
      isActive: req.user.isActive,
    },
  });
};

module.exports = { login, logout, me };
