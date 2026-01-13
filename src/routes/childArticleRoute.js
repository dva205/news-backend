import express from 'express';
import {
  getArticles,
  getAllCategories,
  getArticleById,
  postComment,
  toggleSaveArticle,
  getSavedArticle,
  getRecommendArticle,
} from '../controllers/childArticleController.js';

const router = express.Router();

router.get('/', getArticles);
router.get('/categories', getAllCategories);
router.get('/saved', getSavedArticle);
router.get('/:id', getArticleById);
router.get('/:id/recommend', getRecommendArticle);
router.post('/:id/comments', postComment);
router.post('/:id', toggleSaveArticle);

export default router;
