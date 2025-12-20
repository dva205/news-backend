import express from "express";
import { parentSignUp, parentSignIn, parentSignOut, updateProfile, refreshParentToken } from '../controllers/parentAuthController.js'
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireParent } from '../middlewares/requireParent.js'
import { uploadAvatar } from "../middlewares/uploadFile.js";

const router = express.Router();

router.post('/signup', parentSignUp)
router.post('/signin', parentSignIn)
router.post('/signout', requireAuth, requireParent, parentSignOut)
router.post('/refresh', refreshParentToken)
router.patch('/update', requireAuth, requireParent, uploadAvatar.single('avatar'), updateProfile)

export default router;