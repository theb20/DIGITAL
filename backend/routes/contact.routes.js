import express from "express";
import * as Controller from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/", Controller.list);
router.get("/:id", Controller.get);
router.post("/", Controller.create);
router.delete("/:id", Controller.remove);

export default router;