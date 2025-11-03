import express from "express";
import { parentSignUp, parentSignIn, parentSignOut, refreshToken } from '../controllers/parentAuthController.js'
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

router.post('/signup', parentSignUp)
router.post('/signin', parentSignIn)
router.post('/signout', requireAuth, parentSignOut)
router.post('/refresh', refreshToken)

export default router;