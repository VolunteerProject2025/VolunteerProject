const jwt = require("jsonwebtoken");
const User = require("../models/User");
exports.verifyToken = async (req, res, next) => {
    const token = req.cookies.token; // ✅ Extract token from cookie

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
     
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        return res.status(403).json({ message: "Forbidden - Invalid token" });
    }
};
exports.verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            return res.status(403).json({ message: "Forbidden - Insufficient role" });
        }
        next();
    };
};

