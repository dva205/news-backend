import express from "express";
import { getAccountController } from "../controllers/getAccountController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

router.get('/me', requireAuth, getAccountController)

export default router;