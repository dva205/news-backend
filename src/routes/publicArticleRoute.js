import express from 'express';
import { getArticleFromCategory, getArticleHomePage } from '../controllers/publicArticleController';


const router = express.Router();

router.get('/articles',) // trang chủ
router.get('/articles/categories',) // menu
router.get('/articles/:category',) // category nào
router.get('/articles/:title',) // lấy chi tiết 1 bài báo
router.get('/articles/search?q=tu_khoa',) //search