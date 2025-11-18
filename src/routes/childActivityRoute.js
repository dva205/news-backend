import express from 'express';
import { logChildActivity } from '../controllers/childActivityController.js';

const router = express.Router();

router.post('/log', logChildActivity);

export default router;
