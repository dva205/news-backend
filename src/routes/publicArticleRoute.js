import express from 'express';
import { getAllCategories, getArticle, } from '../controllers/publicArticleController';


const router = express.Router();

router.get('/articles', getArticle) // trang chủ
router.get('/articles/categories', getAllCategories) // menu

export default router;
