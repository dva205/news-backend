import express from 'express';
import { getArticles, getAllCategories, getArticleById, getAllComments } from '../controllers/publicArticleController.js';

const router = express.Router();

router.get('/articles', getArticles);
router.get('/articles/categories', getAllCategories);
router.get('/articles/:id', getArticleById);

router.get('/articles/:id/comments', getAllComments);

export default router;
