import express from "express";
import {
  gatewayHealth,
  backendHealth,
} from "../controllers/healthController.js";

const router = express.Router();

router.get("/", gatewayHealth);
router.get("/backend", backendHealth);

export default router;
