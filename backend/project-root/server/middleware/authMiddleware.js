const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.admin = decoded;

    // Restrict access to ADMIN/SUPER_ADMIN for these dashboard/moderation routes
    if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
      });
    }

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });

  }
};

module.exports = authMiddleware;