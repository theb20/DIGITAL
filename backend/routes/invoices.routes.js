import express from "express";
import * as Controller from "../controllers/invoices.controller.js";

const router = express.Router();

router.get("/", Controller.list);
router.get("/:id", Controller.get);
router.post("/", Controller.create);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

// Actions
router.post("/:id/send-email", Controller.sendEmailForInvoice);
router.post("/:id/status", Controller.updateStatus);

export default router;