import { fetchAllCategories, fetchNews, fetchArticleById, getStrictRules, checkTimeLimit } from '../services/childArticleService.js';

// lấy báo
export const getArticles = async (req, res) => {
    try {
        const childId = req.user.id;

        // TODO: Re-enable time limit check after implementing reading time tracking
        // See childArticleService.js checkTimeLimit() for implementation requirements
        /*
        const timeLimitCheck = await checkTimeLimit(childId);
        if (!timeLimitCheck.allowed) {
            return res.status(403).json({
                EM: "Đã hết thời gian đọc báo trong ngày",
                DT: {
                    timeLimit: timeLimitCheck.timeLimit,
                    timeUsed: timeLimitCheck.timeUsed
                }
            });
        }
        */

        // Get articles with filters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || null;
        const category = req.query.category || null;

        const data = await fetchNews(childId, page, limit, search, category);

        // TODO: Add time limit info when implemented
        // data.timeLimit = timeLimitCheck;

        return res.status(200).json({
            EM: "Lấy danh sách bài báo thành công",
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
        return res.status(500).json({
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

        if (!articleId) {
            return res.status(400).json({
                EM: "Thiếu ID bài báo",
                DT: {}
            });
        }

        // TODO: Re-enable time limit check
        /*
        const timeLimitCheck = await checkTimeLimit(childId);
        if (!timeLimitCheck.allowed) {
            return res.status(403).json({
                EM: "Đã hết thời gian đọc báo trong ngày",
                DT: {
                    timeLimit: timeLimitCheck.timeLimit,
                    timeUsed: timeLimitCheck.timeUsed
                }
            });
        }
        */

        const article = await fetchArticleById(childId, articleId);

        return res.status(200).json({
            EM: "Lấy bài báo thành công",
            DT: {
                article
                // TODO: Add timeRemaining when tracking is implemented
                // timeRemaining: timeLimitCheck.timeRemaining
            }
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
        return res.status(500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
};

// lấy thời gian giới hạn
export const getTimeLimit = async (req, res) => {
    try {
        const childId = req.user.id;
        const timeLimitInfo = await checkTimeLimit(childId);

        return res.status(200).json({
            EM: "Time limit tracking chưa được kích hoạt (xem TODO trong service)",
            DT: timeLimitInfo
        });
    } catch (error) {
        console.error("Lỗi khi lấy time limit:", error);
        return res.status(500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
};
