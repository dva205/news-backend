import express from 'express';
import { getArticles, getAllCategories, getArticleById } from '../controllers/publicArticleController.js';

const router = express.Router();

router.get('/articles', getArticles);
router.get('/articles/categories', getAllCategories);
router.get('/articles/:id', getArticleById);

export default router;
