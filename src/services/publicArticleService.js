import { Op } from "sequelize";
import db from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { formatPublicArticle } from "../helpers/formatPublicArticle.js";

// get all categories
export const fetchAllCategories = async () => {
    const categories = await db.Category.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
    });

    if (!categories) {
        return [];
    }

    return categories;
};

// get all articles
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
        articles: rows.map(article => formatPublicArticle(article)),
        pagination: {
            totalItems: count,
            totalPages,
            currentPage: page,
            limit
        }
    };
};

// get 1 articles by id
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
        throw new ApiError("Không tìm thấy bài báo", 204);
    }

    return formatPublicArticle(article);
};
