import { Op } from "sequelize";
import db from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Get all categories 
 */
export const fetchAllCategories = async () => {
    const categories = await db.Category.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']]
    });

    if (!categories || categories.length === 0) {
        throw new ApiError("Không có category nào", 404);
    }

    return categories;
};

/**
 * Get articles with pagination, search, category filter 
 */
export const fetchNews = async (page, limit, search, categoryName) => {
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    // Search in title and content
    if (search) {
        whereConditions[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { content: { [Op.like]: `%${search}%` } }
        ];
    }

    // Include conditions for category join
    const includeConditions = {
        model: db.Category,
        as: 'category',
        attributes: ['name']
    };

    // Filter by category name if provided
    if (categoryName) {
        includeConditions.where = { name: categoryName };
        includeConditions.required = true; // INNER JOIN
    }

    const { count, rows } = await db.Article.findAndCountAll({
        where: whereConditions,
        include: [includeConditions],
        order: [['published_at', 'DESC']],
        offset,
        limit,
        distinct: true // Important for correct count with joins
    });

    const totalPages = Math.ceil(count / limit);

    return {
        articles: rows,
        pagination: {
            totalArticles: count,
            totalPages,
            currentPage: page,
            limit
        }
    };
};

/**
 * Get single article by ID (public)
 */
export const fetchArticleById = async (articleId) => {
    const article = await db.Article.findOne({
        where: { id: articleId },
        include: [{
            model: db.Category,
            as: 'category',
            attributes: ['name']
        }]
    });

    if (!article) {
        throw new ApiError("Không tìm thấy bài báo", 404);
    }

    return article;
};
