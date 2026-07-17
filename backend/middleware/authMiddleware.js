const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Save user id in request
      req.user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No Token Found",
    });
  }
};

module.exports = protect;