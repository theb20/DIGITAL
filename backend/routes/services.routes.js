import express from "express";
import * as Controller from "../controllers/services.controller.js";

const router = express.Router();

router.get("/", Controller.list);
router.get("/:id", Controller.get);
router.post("/", Controller.create);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

export default router;