import { fetchAllCategories, fetchNews } from "../services/publicArticleService"

export const getArticle = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || null;
        const category = req.query.category || null;

        const data = await fetchNews(page, limit, search, category)

        return res.status(200).json({
            EM: "Lấy bài báo thành công",
            DT: data
        });
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        })
    }
}

export const getAllCategories = async (req, res) => {
    try {
        await fetchAllCategories();
    } catch (error) {
        console.error('Lỗi khi lấy tất cả các mục', error)
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        })
    }
}








