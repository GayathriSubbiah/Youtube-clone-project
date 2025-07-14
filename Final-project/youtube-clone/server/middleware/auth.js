const jwt = require("jsonwebtoken");

// ✅ Use the same secret key used in index.js and login route
const JWT_SECRET = 'yourSecretKeyHere';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    // ✅ Normalize user ID from token payload
    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
    }

    req.user = { userId };
    next();
  } catch (err) {
    console.error("JWT Verification failed:", err.message);
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = authenticate;
