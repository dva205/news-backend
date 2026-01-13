import express from 'express';
import {
  getChildStreak,
  logChildActivity,
  updateChildStreak,
} from '../controllers/childActivityController.js';

const router = express.Router();

router.post('/log', logChildActivity);
router.get('/streak', getChildStreak);
router.post('/streak', updateChildStreak);

export default router;
