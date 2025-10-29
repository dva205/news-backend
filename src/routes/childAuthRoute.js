import express from "express";
import { childSignIn, childLogOut } from '../controllers/childAuthController.js'

const router = express.Router();

router.post('/signin', childSignIn)
router.post('/logout', childLogOut)
// router.post('/refresh')

export default router;