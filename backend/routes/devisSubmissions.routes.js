import express from "express";
import * as Controller from "../controllers/devisSubmissions.controller.js";

const router = express.Router();

router.get("/", Controller.list);
router.get("/:id", Controller.get);
router.get("/by-request/:id", Controller.listByRequestId);
router.post("/", Controller.create);
router.post("/with-pdf", Controller.createWithPdf);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

export default router;