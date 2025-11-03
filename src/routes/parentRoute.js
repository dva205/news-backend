import express from "express";
import { createAccountWithInviteLink } from "../controllers/parentController.js";


const router = express.Router();

router.post('/create', createAccountWithInviteLink)
// router.post('/invite', createInvitation)

export default router;