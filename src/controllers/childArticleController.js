import { fetchAllCategories, fetchNews, fetchArticleById, getStrictRules, fetchAllComment, createComment, changeStatusSave, fetchSavedArticle } from '../services/childArticleService.js';

// lấy báo
export const getArticles = async (req, res) => {
    try {
        const childId = req.user.id;

        // Get articles with filters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || null;
        const category = req.query.category || null;

        const articles = await fetchNews(childId, page, limit, search, category);


        return res.status(200).json({
            EM: "Lấy danh sách bài báo thành công",
            DT: articles
        });
    } catch (error) {
        console.error("Lỗi khi lấy bài báo:", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
};

// lấy category và filter
export const getAllCategories = async (req, res) => {
    try {
        const childId = req.user.id;

        const categories = await fetchAllCategories(childId);

        return res.status(200).json({
            EM: "Lấy danh sách categories thành công",
            DT: categories
        });
    } catch (error) {
        console.error("Lỗi khi lấy categories:", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
};


// lấy 1 bài
export const getArticleById = async (req, res) => {
    try {
        const childId = req.user.id;
        const articleId = req.params.id;

        const article = await fetchArticleById(childId, articleId);

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

// lấy strict rule
export const getMyStrictRules = async (req, res) => {
    try {
        const childId = req.user.id;
        const rules = await getStrictRules(childId);

        return res.status(200).json({
            EM: "Lấy strict rules thành công",
            DT: rules || { hasRules: false }
        });
    } catch (error) {
        console.error("Lỗi khi lấy strict rules:", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
};

// lấy commment
export const getAllComments = async (req, res) => {
    try {
        const articleId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;


        const comment = await fetchAllComment(articleId, page, limit);

        return res.status(200).json({
            EM: "Lấy danh sách bình luận thành công",
            DT: comment
        })
    } catch (error) {
        console.error("Lỗi khi lấy comment:", error);
        return res.status(500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
};

// đăng comment
export const postComment = async (req, res) => {
    try {
        const childId = req.user.id;
        const articleId = req.params.id;
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                EM: "Nội dung bình luận không được để trống",
                DT: {}
            });
        }

        await createComment(childId, articleId, content);

        return res.status(201).json({
            EM: "Đăng bình luận thành công",
            DT: {}
        });
    } catch (error) {
        console.error("Lỗi khi tạo comment:", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}

// save article
export const toggleSaveArticle = async (req, res) => {
    try {
        const childId = req.user.id;
        const articleId = req.params.id;

        const message = await changeStatusSave(childId, articleId);

        return res.status(201).json({
            EM: message,
            DT: {}
        });
    } catch (error) {
        console.error("Lỗi khi tạo comment:", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}

// get all saved article
export const getSavedArticle = async (req, res) => {
    try {
        const childId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const articles = await fetchSavedArticle(childId, page, limit);

        return res.status(200).json({
            EM: "Lấy bài báo đã lưu thành công",
            DT: articles
        })
    } catch (error) {
        console.error("Lỗi khi lấy bài báo đã lưu:", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}


