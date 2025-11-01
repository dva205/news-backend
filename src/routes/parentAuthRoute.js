import express from "express";
import { parentSignUp, parentSignIn, parentSignOut } from '../controllers/parentAuthController.js'

const router = express.Router();

router.post('/signup', parentSignUp)
router.post('/signin', parentSignIn)
router.post('/signout', parentSignOut)
// router.post('/refresh')

export default router;