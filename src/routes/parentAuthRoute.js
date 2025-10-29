import express from "express";
import { parentSignUp, parentSignIn, parentLogOut } from '../controllers/parentAuthController.js'

const router = express.Router();

router.post('/signup', parentSignUp)
router.post('/signin', parentSignIn)
router.post('/logout', parentLogOut)
// router.post('/refresh')

export default router;