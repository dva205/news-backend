import express from "express";
import { parentSignUp, parentSignIn, parentSignOut, updateProfile, refreshParentToken } from '../controllers/parentAuthController.js'
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireParent } from '../middlewares/requireParent.js'
import { uploadAvatar } from "../middlewares/uploadFile.js";
import { getParentAccountController } from "../controllers/getAccountController.js";

const router = express.Router();

router.post('/signup', parentSignUp)
router.post('/signin', parentSignIn)
router.post('/signout', requireAuth, requireParent, parentSignOut)
router.post('/refresh', refreshParentToken)
router.patch('/profile', requireAuth, requireParent, uploadAvatar.single('avatar'), updateProfile)
router.get('/me', requireAuth, requireParent, getParentAccountController)

export default router;