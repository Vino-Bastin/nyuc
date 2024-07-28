const jwt = require("jsonwebtoken");

const Admin = require("../../schema/admin");
const logger = require("../../util/logger");

const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new Error("Unauthorized");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (!admin) throw new Error("Unauthorized");

        req.admin = admin;
        next();
    } catch (error) {
        logger.error("Error in adminAuth: ", error);
        res.redirect("/admin/login");
    }
};

const adminNoAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await Admin.findById(decoded.id);
            if (admin) return res.redirect("/admin/whats-app");
        }

        next();
    } catch (error) {
        logger.error("Error in adminNoAuth: ", error);
        res.redirect("/admin/login");
    }
};

module.exports = { adminAuth, adminNoAuth };
