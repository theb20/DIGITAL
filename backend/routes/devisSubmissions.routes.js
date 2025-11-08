import express from "express";
import * as Controller from "../controllers/devisSubmissions.controller.js";

const router = express.Router();

router.get("/", Controller.list);
router.get("/:id", Controller.get);
router.get("/by-request/:id", Controller.listByRequestId);
router.post("/", Controller.create);
// Route acceptant un payload plus volumineux pour le PDF encodé base64
router.post("/with-pdf", express.json({ limit: "50mb" }), Controller.createWithPdf);
router.post("/:id/send-email", Controller.sendEmail);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

export default router;