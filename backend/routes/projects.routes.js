import express from "express";
import * as Controller from "../controllers/projects.controller.js";

const router = express.Router();

router.get("/", Controller.list);
router.get("/:id", Controller.get);
router.post("/", Controller.create);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

// Upload d'un livrable et envoi par email au client
router.post("/:id/deliverable", Controller.uploadDeliverable);

export default router;