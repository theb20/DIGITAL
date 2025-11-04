import express from "express";
import * as UsersController from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", UsersController.list);
router.get("/:id", UsersController.get);
router.post("/", UsersController.create);
router.put("/:id", UsersController.update);
router.delete("/:id", UsersController.remove);

export default router;