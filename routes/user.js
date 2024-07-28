const express = require("express");
const { validateRequestBody } = require("zod-express-middleware");
const { z } = require("zod");

const userControllers = require("../controllers/userControllers");

const router = express.Router();

const userSchema = z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string().min(6),
});

router.get("/register", userControllers.registerPage);
router.post("/register", validateRequestBody(userSchema), userControllers.register);

module.exports = router;
