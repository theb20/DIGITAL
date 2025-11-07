import express from "express";
import * as UsersController from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", UsersController.list);
router.get("/email/:email", UsersController.getByEmail);
router.get("/:id", UsersController.get);
router.post("/", UsersController.create);
router.post("/logout", UsersController.logout);
router.put("/:id", UsersController.update);
router.delete("/:id", UsersController.remove);

export default router;