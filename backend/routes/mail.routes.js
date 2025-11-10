import express from "express";
import * as Controller from "../controllers/mail.controller.js";

const router = express.Router();

// Endpoint de test d’envoi d’email
router.post("/test", Controller.test);

export default router;