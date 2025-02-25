const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a given user.
 * @param {Object} user - The user object containing _id, email, and role.
 * @param {string} expiresIn - Token expiration time (default: '1h').
 * @returns {string} - Signed JWT token.
 */
const generateToken = (user, expiresIn = '1h') => {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

module.exports = generateToken;
