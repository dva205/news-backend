import { fetchAllCategories, fetchNews, fetchArticleById } from "../services/publicArticleService.js";
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

// lấy báo
export const getArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || null;
        const category = req.query.category || null;

        const data = await fetchNews(page, limit, search, category);

        return sendSuccess(res, data, "Lấy danh sách bài báo thành công", 200);
    } catch (error) {
        console.error("Lỗi khi lấy bài báo:", error);
        return sendError(res, error);
    }
};

// lấy category
export const getAllCategories = async (req, res) => {
    try {
        const categories = await fetchAllCategories();

        return sendSuccess(res, categories, "Lấy danh sách categories thành công", 200);
    } catch (error) {
        console.error('Lỗi khi lấy categories:', error);
        return sendError(res, error);
    }
};

// lấy 1 bài báo
export const getArticleById = async (req, res) => {
    try {
        const articleId = req.params.id;

        const article = await fetchArticleById(articleId);

        return sendSuccess(res, article, "Lấy chi tiết bài báo thành công", 200);
    } catch (error) {
        console.error("Lỗi khi lấy bài báo:", error);
        return sendError(res, error);
    }
};
