import { Op } from "sequelize";
import db from "../models";
import { ApiError } from "../utils/ApiError";

export const fetchAllCategories = async () => {

    const allCategories = await db.Article.aggregate('category', 'DISTINCT', { plain: false })

    if (!allCategories || allCategories.length == 0) {
        throw new ApiError("Không có mục nào để hiển thị", 404)
    }

    const categories = allCategories.map(item => item.DISTINCT);

    return categories;
}

export const fetchNews = async (page, limit, search, category) => {
    const offset = (page - 1) * limit;

    let whereClause = {};

    if (search) {
        whereClause[Op.or] = [
            {
                title: {
                    [Op.like]: `%${search}%`
                }
            },
            {
                content: {
                    [Op.like]: `%${search}%`
                }
            }
        ]
    }

    if (category) {
        whereClause.category = category;
    }

    const { count, rows } = await db.Article.findAndCountAll({
        where: whereClause,
        order: [
            ['published_at', 'DESC'] // Sắp xếp mới nhất lên đầu
        ],
        offset,
        limit,
        attributes: {
            exclude: ['content']
        }
    });


    const totalPages = Math.ceil(count / limit)

    return {
        articles: rows,
        pagination: {
            totalArticles: count,
            totalPages,
            currentPage: page,
            limit
        }
    }
}

