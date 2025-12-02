import express from 'express';
import {
    getArticles,
    getAllCategories,
    getArticleById,
    getMyStrictRules,
    getAllComments,
    postComment,
    toggleSaveArticle,
    getSavedArticle,
} from '../controllers/childArticleController.js';

const router = express.Router();

router.get('/articles', getArticles);
router.get('/articles/categories', getAllCategories);
router.get('/strict-rules', getMyStrictRules);
router.get('/articles/saved', getSavedArticle)
router.get('/articles/:id', getArticleById);

router.get('/articles/:id/comments', getAllComments);
router.post('/articles/:id/comments', /*checkBadWord,*/ postComment)

router.post('/articles/:id', toggleSaveArticle);



export default router;
