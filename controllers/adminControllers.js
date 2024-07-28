const isValidObjectId = require("mongoose").isValidObjectId;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../schema/user");
const Template = require("../schema/template");
const Admin = require("../schema/admin");

const logger = require("../util/logger");
const sendWhatsAppMessages = require("../util/helpers/sendWhatsappMessage");

exports.loginPage = (req, res) => {
    try {
        res.render("admin/login", {
            title: "Admin - Login",
        });
    } catch (error) {
        logger.error("Error in adminControllers.loginPage: ", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email }).select("+password");
        if (!admin) {
            return res.status(400).json({ ok: false, message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ ok: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
            expiresIn: "3d",
        });
        res.cookie("token", token, {
            maxAge: 3 * 24 * 60 * 60 * 1000,
            secure: true,
            httpOnly: true,
        });

        res.status(200).json({ ok: true, message: "Logged In" });
    } catch (error) {
        logger.error("Error in adminControllers.login: ", error);
        res.status(500).json({ ok: false, message: "Internal Server Error" });
    }
};

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        let admin = await Admin.findOne({
            email,
        });
        if (admin) {
            return res.status(400).json({ ok: false, message: "Admin already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        admin = new Admin({
            email,
            password: hashedPassword,
        });
        await admin.save();

        res.status(201).json({ ok: true, message: "Admin created" });
    } catch (error) {
        logger.error("Error in adminControllers.register: ", error);
        res.status(500).json({ ok: false, message: "Internal Server Error" });
    }
};

exports.logout = (req, res) => {
    try {
        res.clearCookie("token");
        res.redirect("/admin/login");
    } catch (error) {
        logger.error("Error in adminControllers.logout: ", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.whatsappPage = (req, res) => {
    try {
        res.render("admin/whatsapp", {
            title: "Admin - Whatsapp",
        });
    } catch (error) {
        logger.error("Error in adminControllers.whatsappPage: ", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.createWhatsappTemplate = async (req, res) => {
    try {
        const { name, interaktId, headerType, headerText, imageUrl, bodyVariables } = req.body;

        const template = new Template({
            name,
            interaktId,
            headerType,
            headerText,
            imageUrl,
            bodyVariables,
        });
        await template.save();

        res.status(201).json({ ok: true, message: "Whatsapp Template created" });
    } catch (error) {
        logger.error("Error in adminControllers.createWhatsappTemplate: ", error);
        res.status(500).json({ ok: false, message: "Internal Server Error" });
    }
};

exports.getWhatsappTemplates = async (req, res) => {
    try {
        const templates = await Template.find();
        res.status(200).json({ ok: true, templates });
    } catch (error) {
        logger.error("Error in adminControllers.getWhatsappTemplates: ", error);
        res.status(500).json({ ok: false, message: "Internal Server Error" });
    }
};

exports.sendWhatsappMessage = async (req, res) => {
    try {
        const { templateId } = req.body;
        if (!isValidObjectId(templateId))
            return res.status(400).json({ ok: false, message: "Invalid Template Id" });
        const users = await User.find({});
        if (!users) return res.status(400).json({ ok: false, message: "User not found" });
        const template = await Template.findById(templateId);
        if (!template) return res.status(400).json({ ok: false, message: "Template not found" });

        sendWhatsAppMessages(users, template, template.name);
        res.status(200).json({ ok: true, message: "Whatsapp Message scheduled" });
    } catch (error) {
        logger.error("Error in adminControllers.sendWhatsappMessage: ", error);
        res.status(500).json({ ok: false, message: "Internal Server Error" });
    }
};
