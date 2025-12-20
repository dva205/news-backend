import express from 'express';
import { forceUserLogOut, validateSession } from '../controllers/publicAuthController.js';

const router = express.Router();

router.get('/validate-session', validateSession);
router.post('/clear-session', forceUserLogOut);

export default router;
