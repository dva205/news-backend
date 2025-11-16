import express from 'express';
import requireAuth from '../middlewares/requireAuth.js';
import requireChild from '../middlewares/requireChild.js'

const router = express.Router();

router.get('/articles', requireAuth, requireChild, getArticle) // trang chủ
router.get('/articles/categories', getAllCategories) // menu

export default router;
