const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../schema/user");
const logger = require("../util/logger");

exports.registerPage = (req, res) => {
    try {
        res.render("users/register", {
            title: "Register",
        });
    } catch (error) {
        logger.error("Error in usersControllers.registerPage: ", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.register = async (req, res) => {
    try {
        const { email, firstName, lastName, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                ok: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            email,
            profile: {
                firstName,
                lastName,
            },
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            ok: "User created successfully",
        });
    } catch (error) {
        logger.error("Error in usersControllers.register: ", error);
        res.status(500).send("Internal Server Error");
    }
};
