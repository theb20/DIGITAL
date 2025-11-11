import express from "express";
import * as PlanningsController from "../controllers/plannings.controller.js";

const router = express.Router();

router.get("/", PlanningsController.list);
router.get("/week/:weekKey", PlanningsController.getByWeek);
router.post("/", PlanningsController.create);

export default router;