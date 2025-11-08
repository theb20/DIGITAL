import express from "express";
import * as Controller from "../controllers/services.controller.js";
import * as CommentsController from "../controllers/comments.controller.js";

const router = express.Router();

router.get("/", Controller.list);
router.get("/:id", Controller.get);
router.post("/", Controller.create);
router.post("/bulk", Controller.bulkCreate);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

// Routes imbriquées: commentaires d'un service
router.get("/:id/comments", CommentsController.listForService);
router.post("/:id/comments", CommentsController.createForService);

export default router;