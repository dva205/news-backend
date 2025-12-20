import express from "express";
import { getAccountController } from "../controllers/getAccountController.js";

const router = express.Router();

router.get('/me', getAccountController)

export default router;