import express from "express";
import { PaymentController } from "../controllers/pay.controller.js";

const router = express.Router();

// Liens de vérification/confirmation conservés pour compatibilité (priorisés)
router.get("/verify/:link", PaymentController.verifyPayment);
router.post("/confirm", PaymentController.confirm);

// CRUD
router.get("/", PaymentController.list);
router.get("/:id", PaymentController.get);
router.post("/", PaymentController.createPayment);
router.put("/:id", PaymentController.update);
router.delete("/:id", PaymentController.remove);

export default router;
