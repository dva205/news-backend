import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireChild } from '../middlewares/requireChild.js';
import { 
    getArticles, 
    getAllCategories, 
    getArticleById, 
    getMyStrictRules, 
    getTimeLimit 
} from '../controllers/childArticleController.js';

const router = express.Router();

// All routes require auth + child role
router.get('/', requireAuth, requireChild, getArticles);
router.get('/categories', requireAuth, requireChild, getAllCategories);
router.get('/strict-rules', requireAuth, requireChild, getMyStrictRules);
router.get('/time-limit', requireAuth, requireChild, getTimeLimit);
router.get('/:id', requireAuth, requireChild, getArticleById);

export default router;
