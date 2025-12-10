import { fetchAllCategories, fetchNews, fetchArticleById, fetchAllComment } from "../services/publicArticleService.js";
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

// lấy commment
export const getAllComments = async (req, res) => {
    try {
        const articleId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const comment = await fetchAllComment(articleId, page, limit);

        return sendSuccess(res, comment, "Lấy danh sách bình luận thành công", 200);
    } catch (error) {
        console.error("Lỗi khi lấy comment:", error);
        return sendError(res, error);
    }
};