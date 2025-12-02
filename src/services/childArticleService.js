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
    const categories = await db.Category.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']]
    });

    if (!categories || categories.length === 0) {
        throw new ApiError("Không có category nào", 204);
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

    // Include conditions for category join
    const includeConditions = {
        model: db.Category,
        as: 'category',
        attributes: ['name']
    };

    // Query
    const { count, rows } = await db.Article.findAndCountAll({
        where: whereConditions,
        include: [includeConditions],
        order: [['published_at', 'DESC']],
        offset,
        limit,
        distinct: true
    });

    if (!rows || rows.length === 0) {
        throw new ApiError("Không có bài báo nào", 204);
    }

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

export const fetchAllComment = async (articleId, page, limit) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await db.Comment.findAndCountAll({
        where: { article_id: articleId },
        offset,
        limit,
        order: [['createdAt', 'DESC']],
        include: [{
            model: db.User, as: 'user', attributes: ['username', 'avatar_url']
        }]
    });

    const totalPages = Math.ceil(count / limit);

    return {
        comments: rows,
        pagination: {
            totalComment: count,
            totalPages,
            currentPage: page,
            limit
        }
    }
};

export const createComment = async (childId, articleId, content) => {
    // check if article exist
    const articleExists = await db.Article.findOne({ where: { id: articleId } })
    if (!articleExists) {
        throw new ApiError('Bài viết không tồn tại hoặc đã bị xóa', 404)
    }

    await db.Comment.create({
        child_id: childId,
        article_id: articleId,
        content
    });

    return;
};

export const changeStatusSave = async (childId, articleId) => {
    const existArticle = await db.Article.findOne({
        where: { id: articleId }
    });

    if (!existArticle) {
        throw new ApiError('Không tìm thấy bài viết hoặc bài viết đã bị xóa', 400);
    }

    const isSaved = await db.SavedArticle.findOne({
        where: {
            article_id: articleId,
            child_id: childId
        }
    });

    let status = ''

    if (!isSaved) {
        await db.SavedArticle.create({
            article_id: articleId,
            child_id: childId
        })
        status = 'Lưu bài báo thành công'
    } else {
        await isSaved.destroy();
        status = 'Bỏ lưu thành công'
    }

    return status;
}

export const fetchSavedArticle = async (childId, page, limit) => {
    const offset = (page - 1) * limit;


    const { count, rows } = await db.SavedArticle.findAndCountAll({
        where: { child_id: childId },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [{
            model: db.Article,
            as: 'article',
            attributes: ['title', 'content', 'image_url', 'published_at'],
            include: [{
                model: db.Category,
                as: 'category',
                attributes: ['name']
            }] // hiển thị ra card
        }]
    });

    if (!rows || rows.length === 0) {
        throw new ApiError("Không có bài báo nào", 204);
    }

    const totalPages = Math.ceil(count / limit);

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




