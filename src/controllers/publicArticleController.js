import { fetchAllCategories, fetchNews, fetchArticleById } from "../services/publicArticleService.js";

// lấy báo
export const getArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || null;
        const category = req.query.category || null;

        const data = await fetchNews(page, limit, search, category);

        return res.status(200).json({
            EM: "Lấy bài báo thành công",
            DT: data
        });
    } catch (error) {
        console.error("Lỗi khi lấy bài báo:", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
};

// lấy category
export const getAllCategories = async (req, res) => {
    try {
        const categories = await fetchAllCategories();

        return res.status(200).json({
            EM: "Lấy danh sách categories thành công",
            DT: categories
        });
    } catch (error) {
        console.error('Lỗi khi lấy categories:', error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
};

// lấy 1 bài báo
export const getArticleById = async (req, res) => {
    try {
        const articleId = req.params.id;

        const article = await fetchArticleById(articleId);

        return res.status(200).json({
            EM: "Lấy bài báo thành công",
            DT: article
        });
    } catch (error) {
        console.error("Lỗi khi lấy bài báo:", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
};
