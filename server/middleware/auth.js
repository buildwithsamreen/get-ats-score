const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization; // "Bearer token"
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId: ... }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token invalid" });
  }
};
