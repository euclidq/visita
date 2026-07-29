const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

module.exports = async (req, res, next) => {
  try {
    const payload = jwt.verify(
      req.cookies["visita-session-cookie"],
      process.env.JWT_SECRET,
    );
    const user = await User.findById(payload.sub);

    if (!user?.isActive) {
      throw new Error("Inactive user");
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      title: "Unauthorized",
      message: "Please log in to continue",
    });
  }
};
