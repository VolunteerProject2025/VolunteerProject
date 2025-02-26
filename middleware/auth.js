const jwt = require("jsonwebtoken");
exports.authenticateToken = async (req, res, next) => {
    const token = req.cookies.token; // ✅ Extract token from cookie

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
     
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Forbidden - Invalid token" });
    }
};
exports.checkRole = (req, res, next) => {
    // Check if the user object is populated from the JWT token
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Forbidden - No role assigned" });
    }

    // If the user has a role, allow them to proceed
    next();
};


