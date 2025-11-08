import { Router } from "express";
import * as Controller from "../controllers/profiles.controller.js";

const router = Router();

router.get("/", Controller.list);
router.get("/active", Controller.getActive);
router.get("/:id", Controller.get);
router.post("/", Controller.create);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

export default router;