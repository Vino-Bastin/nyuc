const express = require("express");
const { z } = require("zod");
const { validateRequestBody } = require("zod-express-middleware");

const { adminAuth, adminNoAuth } = require("../middlewares/auth/adminAuth");
const adminControllers = require("../controllers/adminControllers");

const router = express.Router();

const adminSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

router.get("/", adminNoAuth, adminControllers.loginPage);
router.get("/login", adminNoAuth, adminControllers.loginPage);
router.post("/login", adminNoAuth, validateRequestBody(adminSchema), adminControllers.login);
// router.post("/register", adminNoAuth, validateRequestBody(adminSchema), adminControllers.register);
router.get("/logout", adminAuth, adminControllers.logout);

router.get("/whats-app", adminAuth, adminControllers.whatsappPage);
router.post("/whatsapp/template", adminAuth, adminControllers.createWhatsappTemplate);
router.get("/whatsapp/template", adminAuth, adminControllers.getWhatsappTemplates);
router.post("/whatsapp/send", adminAuth, adminControllers.sendWhatsappMessage);

module.exports = router;
