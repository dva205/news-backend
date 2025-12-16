import { Op } from 'sequelize';
import db from "../models/index.js";
import { ApiError } from '../utils/ApiError.js';
import { formatArticleResponse, formatCommentResponse } from '../helpers/formatArticle.js';


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
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
    });

    if (!categories) return [];

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

    const andCriteria = [];
    const whereConditions = {};

    // Search
    if (search) {
        andCriteria.push({
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ]
        });
    }

    // Include conditions for category join
    const includeConditions = {
        model: db.Category,
        as: 'category',
        attributes: ['id', 'name'],
    };

    if (categoryName) {
        includeConditions.where = { name: categoryName };
        includeConditions.required = true; // INNER JOIN
    }

    // Apply blocked_category
    if (strictRules?.blocked_category) {
        // convert sang array
        const blockedCategoryArray = JSON.parse(strictRules.blocked_category);

        if (blockedCategoryArray.length > 0) {
            const blockedCategories = await db.Category.findAll({
                where: { name: { [Op.in]: blockedCategoryArray } },  // Tìm categories có tên trong array
                attributes: ['id'], // lấy id,
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
                andCriteria.push({
                    [Op.and]: [
                        { title: { [Op.notLike]: `% ${keyword} %` } },
                        { content: { [Op.notLike]: `% ${keyword} %` } }
                    ]
                });
            });
        }
    }

    if (andCriteria.length > 0) {
        whereConditions[Op.and] = andCriteria;
    }

    // Query
    const { count, rows } = await db.Article.findAndCountAll({
        where: whereConditions,
        include: [includeConditions],
        order: [['published_at', 'DESC']],
        offset,
        limit,
    });

    // check save once by 
    const articleIds = rows.map(article => article.id);
    let savedArticleIds = new Set();

    if (articleIds.length > 0) {
        const savedRecords = await db.SavedArticle.findAll({
            where: {
                child_id: childId,
                article_id: { [Op.in]: articleIds } // Chỉ check trong danh sách bài hiện tại
            },
            attributes: ['article_id'],
        });

        // Tạo một Set chứa các ID đã lưu để check cho nhanh (O(1))
        savedRecords.forEach(record => savedArticleIds.add(record.article_id));
    }

    const totalPages = Math.ceil(count / limit);

    return {
        articles: rows.map(article => formatArticleResponse(article, savedArticleIds.has(article.id))),
        pagination: {
            totalItems: count,
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

    const savedRecord = await db.SavedArticle.findOne({
        where: { child_id: childId, article_id: articleId }
    });

    return formatArticleResponse(article, !!savedRecord);
};

export const createComment = async (childId, articleId, content) => {
    // tìm báo để xem có bị cấm ko
    const article = await db.Article.findOne({
        where: { id: articleId },
        include: [{
            model: db.Category,
            as: 'category',
            attributes: ['name']
        }]
    });

    if (!article) {
        throw new ApiError('Bài báo không tồn tại hoặc đã bị xóa', 404)
    }

    const strictRules = await getStrictRules(childId);

    if (strictRules?.blocked_category) {
        const blockedCategoryArray = JSON.parse(strictRules.blocked_category);
        if (blockedCategoryArray.includes(article.category.name)) {
            throw new ApiError("Bạn không thể bình luận vì bài viết thuộc danh mục bị hạn chế", 403);
        }
    }

    if (strictRules?.blocked_keyword) {
        const blockedKeywordArray = JSON.parse(strictRules.blocked_keyword);

        const text = `${article.title} ${article.content}`.toLowerCase();
        const hasBlockedKeyword = blockedKeywordArray.some(kw =>
            text.includes(kw.toLowerCase())
        );

        if (hasBlockedKeyword) {
            throw new ApiError("Bạn không thể bình luận vì bài viết chứa nội dung bị hạn chế", 403);
        }
    }

    const newComment = await db.Comment.create({
        child_id: childId,
        article_id: articleId,
        content
    });

    const fullComment = await db.Comment.findByPk(newComment.id, {
        include: [{
            model: db.User,
            as: 'user',
            attributes: ['username', 'avatar_url']
        }]
    });

    return formatCommentResponse(fullComment);
};

export const changeStatusSave = async (childId, articleId) => {
    const article = await db.Article.findOne({
        where: { id: articleId },
        include: [{
            model: db.Category,
            as: 'category',
            attributes: ['name']
        }]
    });

    if (!article) {
        throw new ApiError('Bài báo không tồn tại hoặc đã bị xóa', 404)
    }

    const strictRules = await getStrictRules(childId);

    if (strictRules?.blocked_category) {
        const blockedCategoryArray = JSON.parse(strictRules.blocked_category);
        if (blockedCategoryArray.includes(article.category.name)) {
            throw new ApiError("Bạn không thể lưu bài viết vì bài viết thuộc danh mục bị hạn chế", 403);
        }
    }

    if (strictRules?.blocked_keyword) {
        const blockedKeywordArray = JSON.parse(strictRules.blocked_keyword);

        const text = `${article.title} ${article.content}`.toLowerCase();
        const hasBlockedKeyword = blockedKeywordArray.some(kw =>
            text.includes(kw.toLowerCase())
        );

        if (hasBlockedKeyword) {
            throw new ApiError("Bạn không thể lưu bài viết vì bài viết chứa nội dung bị hạn chế", 403);
        }
    }

    const savedRecord = await db.SavedArticle.findOne({
        where: { article_id: articleId, child_id: childId }
    });

    let message = '';
    let isSaved = false;

    if (!savedRecord) {
        await db.SavedArticle.create({
            article_id: articleId,
            child_id: childId
        });
        message = 'Đã lưu bài viết vào danh sách đọc sau';
        isSaved = true;
    } else {
        await savedRecord.destroy();
        message = 'Đã bỏ lưu bài viết';
        isSaved = false;
    }

    return { message, isSaved };
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
            include: [{
                model: db.Category,
                as: 'category',
                attributes: ['name']
            }] // hiển thị ra card
        }],
    });

    const articles = rows.map(item => formatArticleResponse(item, true));

    const totalPages = Math.ceil(count / limit);

    return {
        articles,
        pagination: {
            totalArticles: count,
            totalPages,
            currentPage: page,
            limit
        }
    }
}




