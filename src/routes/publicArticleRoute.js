import express from 'express';
import { getArticles, getAllCategories, getArticleById, getAllComments } from '../controllers/publicArticleController.js';

const router = express.Router();

router.get('/', getArticles);
router.get('/categories', getAllCategories);
router.get('/:id', getArticleById);
router.get('/:id/comments', getAllComments);

export default router;
