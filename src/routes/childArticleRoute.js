import express from 'express';
import { getArticles, getAllCategories, getArticleById, getMyStrictRules, postComment, toggleSaveArticle, getSavedArticle } from '../controllers/childArticleController.js';

const router = express.Router();

router.get('/', getArticles);
router.get('/categories', getAllCategories);
router.get('/strict-rules', getMyStrictRules);
router.get('/saved', getSavedArticle)
router.get('/:id', getArticleById);

router.post('/:id/comments', /*checkBadWord,*/ postComment)
router.post('/:id', toggleSaveArticle);



export default router;
