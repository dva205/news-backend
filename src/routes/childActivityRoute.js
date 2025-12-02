import express from 'express';
import { logChildActivity } from '../controllers/childActivityController.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireChild } from '../middlewares/requireChild.js';

const router = express.Router();

router.post('/log', requireAuth, requireChild, logChildActivity);

export default router;
