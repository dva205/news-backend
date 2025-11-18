import { Op } from 'sequelize';
import db from "../models/index.js";
import { ApiError } from '../utils/ApiError.js';


export const getStrictRules = async (childId) => {
    return await db.Strict.findOne({
        where: { child_id: childId }
    });
};


export const fetchAllCategories = async (childId) => {
    // Get strict rules
    const strictRules = await getStrictRules(childId);

    // Query all categories
    let categories = await db.Category.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']]
    });

    if (!categories || categories.length === 0) {
        throw new ApiError("Không có category nào", 404);
    }

    // Filter blocked categories if strict rules exist
    if (strictRules?.blocked_category) {
        const blockedCategoryArray = JSON.parse(strictRules.blocked_category);

        if (blockedCategoryArray.length > 0) {
            categories = categories.filter(cat =>
                !blockedCategoryArray.includes(cat.name)
            );
        }
    }

    return categories;
};


export const fetchNews = async (childId, page, limit, search, categoryName) => {
    const offset = (page - 1) * limit;
    const strictRules = await getStrictRules(childId);

    const whereConditions = {};

    // Search
    if (search) {
        whereConditions[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { content: { [Op.like]: `%${search}%` } }
        ];
    }

    // Apply blocked_category
    if (strictRules?.blocked_category) {
        // convert sang array
        const blockedCategoryArray = JSON.parse(strictRules.blocked_category);

        if (blockedCategoryArray.length > 0) {
            const blockedCategories = await db.Category.findAll({
                where: { name: { [Op.in]: blockedCategoryArray } },  // Tìm categories có tên trong array
                attributes: ['id'] // lấy id
            });

            const blockedIds = blockedCategories.map(c => c.id);

            if (blockedIds.length > 0) {
                whereConditions.category_id = { [Op.notIn]: blockedIds };
            }
        }
    }

    // Apply blocked_keyword
    if (strictRules?.blocked_keyword) {
        // convert sang array
        const blockedKeywordArray = JSON.parse(strictRules.blocked_keyword);

        if (blockedKeywordArray.length > 0) {
            blockedKeywordArray.forEach(keyword => {
                whereConditions[Op.and] = whereConditions[Op.and] || [];
                whereConditions[Op.and].push({
                    [Op.and]: [
                        { title: { [Op.notLike]: `%${keyword}%` } },
                        { content: { [Op.notLike]: `%${keyword}%` } }
                    ]
                });
            });
        }
    }

    // Query
    const { count, rows } = await db.Article.findAndCountAll({
        where: whereConditions,
        include: [{
            model: db.Category,
            as: 'category',
            attributes: ['name']
        }],
        order: [['published_at', 'DESC']],
        offset,
        limit,
        distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    return {
        articles: rows,
        strictRules: strictRules ? {
            hasRules: true,
            blockedCategories: strictRules.blocked_category || [],
            blockedKeywords: strictRules.blocked_keyword || [],
            timeLimit: strictRules.time_limit_minutes
        } : {
            hasRules: false
        },
        pagination: {
            totalArticles: count,
            totalPages,
            currentPage: page,
            limit
        }
    };
};


export const fetchArticleById = async (childId, articleId) => {
    const strictRules = await getStrictRules(childId);

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

    // Check if category is blocked
    if (strictRules?.blocked_category) {
        const blockedCategoryArray = JSON.parse(strictRules.blocked_category);

        if (blockedCategoryArray.length > 0 && blockedCategoryArray.includes(article.category.name)) {
            throw new ApiError("Bài báo này đã bị chặn bởi phụ huynh", 403);
        }
    }

    // Check if contains blocked keywords
    if (strictRules?.blocked_keyword) {
        const blockedKeywordArray = JSON.parse(strictRules.blocked_keyword);

        if (blockedKeywordArray.length > 0) {
            const text = `${article.title} ${article.content}`.toLowerCase();
            const hasBlockedKeyword = blockedKeywordArray.some(kw =>
                text.includes(kw.toLowerCase())
            );

            if (hasBlockedKeyword) {
                throw new ApiError("Bài báo này đã bị chặn bởi phụ huynh", 403);
            }
        }
    }

    return article;
};


/**
 * TODO: Implement time limit tracking properly
 * 
 * Requirements to enable this feature:
 * 1. Add migration: ALTER TABLE user_articles ADD COLUMN reading_time_seconds INT DEFAULT 0
 * 2. Update UserArticle model to include reading_time_seconds field
 * 3. Create API: POST /child/articles/:id/track-reading { readingTimeSeconds }
 * 4. Frontend: Track reading time and send to API periodically (every 30s or on page leave)
 * 
 * Current status: DISABLED - field reading_time_seconds doesn't exist in database
 */
export const checkTimeLimit = async (childId) => {
    // Temporarily return allowed=true until tracking is implemented
    return {
        allowed: true,
        timeRemaining: null,
        hasLimit: false,
        timeLimit: null,
        timeUsed: 0
    };

    /* ORIGINAL IMPLEMENTATION - Requires reading_time_seconds field in user_articles table
    
    const strictRules = await getStrictRules(childId);

    if (!strictRules || !strictRules.time_limit_minutes) {
        return {
            allowed: true,
            timeRemaining: null,
            hasLimit: false
        };
    }

    // Get today's reading time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userArticles = await db.UserArticle.findAll({
        where: {
            user_id: childId,
            created_at: { [Op.gte]: today }
        }
    });

    const totalMinutesUsed = userArticles.reduce((sum, ua) => {
        return sum + (ua.reading_time_seconds || 0);
    }, 0) / 60;

    const remaining = strictRules.time_limit_minutes - totalMinutesUsed;

    return {
        allowed: remaining > 0,
        hasLimit: true,
        timeLimit: strictRules.time_limit_minutes,
        timeUsed: Math.round(totalMinutesUsed),
        timeRemaining: Math.max(0, Math.round(remaining))
    };
    */
};
