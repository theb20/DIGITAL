import express from "express";
import * as Controller from "../controllers/privacy.controller.js";

const router = express.Router();

router.get("/", Controller.list);
router.get("/sections", Controller.sections);
router.get("/section/:sectionNumber", Controller.bySection);
router.get("/:id", Controller.get);
router.post("/", Controller.create);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

export default router;