import { fetchAllCategories, fetchNews, fetchArticleById, getStrictRules, createComment, changeStatusSave, fetchSavedArticle } from '../services/childArticleService.js';
import { sendError, sendSuccess } from '../utils/ApiResponse.js';

// lấy báo
export const getArticles = async (req, res) => {
    try {
        const childId = req.user.id;

        if (!childId) {
            return sendError(res, {
                statusCode: 401,
                message: "Nguời dùng không có quyền thực hiện hành động này"
            });
        }

        // Get articles with filters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || null;
        const category = req.query.category || null;

        const articles = await fetchNews(childId, page, limit, search, category);


        return sendSuccess(res, articles, "Lấy danh sách bài báo thành công", 200);
    } catch (error) {
        console.error("Lỗi khi lấy bài báo:", error);
        return sendError(res, error);
    }
};

// lấy category và filter
export const getAllCategories = async (req, res) => {
    try {
        const childId = req.user.id;

        if (!childId) {
            return sendError(res, {
                statusCode: 401,
                message: "Nguời dùng không có quyền thực hiện hành động này"
            });
        }

        const categories = await fetchAllCategories(childId);

        return sendSuccess(res, categories, "Lấy danh sách categories thành công", 200);
    } catch (error) {
        console.error("Lỗi khi lấy categories:", error);
        return sendError(res, error);
    }
};


// lấy 1 bài
export const getArticleById = async (req, res) => {
    try {
        const childId = req.user.id;
        const articleId = req.params.id;

        if (!childId) {
            return sendError(res, {
                statusCode: 401,
                message: "Nguời dùng không có quyền thực hiện hành động này"
            });
        }

        const article = await fetchArticleById(childId, articleId);

        return sendSuccess(res, article, "Lấy bài báo thành công", 200);
    } catch (error) {
        console.error("Lỗi khi lấy bài báo:", error);
        return sendError(res, error);
    }
};

// lấy strict rule
export const getMyStrictRules = async (req, res) => {
    try {
        const childId = req.user.id;
        if (!childId) {
            return sendError(res, {
                statusCode: 401,
                message: "Nguời dùng không có quyền thực hiện hành động này"
            });
        }


        const rules = await getStrictRules(childId);

        const data = rules || { hasRules: false };

        return sendSuccess(res, data, "Lấy strict rules thành công", 200);
    } catch (error) {
        console.error("Lỗi khi lấy strict rules:", error);
        return sendError(res, error);
    }
};

// đăng comment
export const postComment = async (req, res) => {
    try {
        const childId = req.user.id;
        const articleId = req.params.id;
        const { content } = req.body;

        if (!childId) {
            return sendError(res, {
                statusCode: 401,
                message: "Nguời dùng không có quyền thực hiện hành động này"
            });
        }

        if (!content || content.trim() === "") {
            return sendError(res, {
                statusCode: 400,
                message: "Nội dung bình luận không được để trống"
            });
        }

        const newComment = await createComment(childId, articleId, content);

        return sendSuccess(res, newComment, "Đăng bình luận thành công", 201);
    } catch (error) {
        console.error("Lỗi khi tạo comment:", error);
        return sendError(res, error);
    }
}

// save article
export const toggleSaveArticle = async (req, res) => {
    try {
        const childId = req.user.id;
        const articleId = req.params.id;

        if (!childId) {
            return sendError(res, {
                statusCode: 401,
                message: "Nguời dùng không có quyền thực hiện hành động này"
            });
        }

        const data = await changeStatusSave(childId, articleId);

        return sendSuccess(res, data.isSaved, data.message, 201);
    } catch (error) {
        console.error("Lỗi khi toggle save article:", error);
        return sendError(res, error);
    }
}

// get all saved article
export const getSavedArticle = async (req, res) => {
    try {
        const childId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!childId) {
            return sendError(res, {
                statusCode: 401,
                message: "Nguời dùng không có quyền thực hiện hành động này"
            });
        }

        const articles = await fetchSavedArticle(childId, page, limit);

        return sendSuccess(res, articles, "Lấy bài báo đã lưu thành công", 200);
    } catch (error) {
        console.error("Lỗi khi lấy bài báo đã lưu:", error);
        return sendError(res, error);
    }
}


