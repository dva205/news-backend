import express from 'express';
import {
  validateInvite,
  activateChildAccount,
  childSignIn,
  childSignOut,
  refreshChildToken,
  getMyStrictRules,
  updateProfile,
} from '../controllers/childAuthController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireChild } from '../middlewares/requireChild.js';
import { getChildAccountController } from '../controllers/getAccountController.js';
import { uploadAvatar } from '../middlewares/uploadFile.js';

const router = express.Router();

router.get('/invite', validateInvite);
router.post('/activate', activateChildAccount);
router.post('/signin', childSignIn);
router.post('/signout', requireAuth, requireChild, childSignOut);
router.post('/refresh', refreshChildToken);
router.get('/strict-rules', requireAuth, requireChild, getMyStrictRules);
router.get('/me', requireAuth, requireChild, getChildAccountController);
router.patch(
  '/profile',
  requireAuth,
  requireChild,
  uploadAvatar.single('avatar'),
  updateProfile
);

export default router;
