import express from "express";
import { validateInvite, activateChildAccount, childSignIn, childSignOut, refreshToken } from "../controllers/childAuthController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireChild } from "../middlewares/requireChild.js"

const router = express.Router();

router.get('/invite', validateInvite)
router.post('/activate', activateChildAccount)
router.post('/signin', childSignIn)
router.post('/signout', requireAuth, requireChild, childSignOut)
router.post('/refresh', refreshToken)

export default router;