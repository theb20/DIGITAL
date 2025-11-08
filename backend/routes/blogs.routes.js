import express from "express";
import * as Controller from "../controllers/blogs.controller.js";
import * as CommentsController from "../controllers/comments.controller.js";

const router = express.Router();

router.get("/", Controller.list);
router.get("/:id", Controller.get);
router.post("/", Controller.create);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

// Routes imbriquées: commentaires d'un blog
router.get("/:id/comments", CommentsController.listForBlog);
router.post("/:id/comments", CommentsController.createForBlog);

export default router;