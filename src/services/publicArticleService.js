import { Op } from 'sequelize';
import db from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { formatPublicArticle } from '../helpers/formatPublicArticle.js';
import { formatCommentResponse } from '../helpers/formatArticle.js';
import { searchArticle } from '../utils/aiService.js';

// get all categories
export const fetchAllCategories = async () => {
  const categories = await db.Category.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
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
    const articles = await searchArticle(search);

    if (!articles || articles.length === 0) {
      return {
        articles: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          limit,
        },
      };
    }

    const sourceUrls = articles.map((a) => a.url);

    whereConditions.source_url = { [Op.in]: sourceUrls };
  }

  // Include conditions for category join
  const includeConditions = {
    model: db.Category,
    as: 'category',
    attributes: ['id', 'name'],
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
    distinct: true, // Important for correct count with joins
  });

  const totalPages = Math.ceil(count / limit);

  return {
    articles: rows.map((article) => formatPublicArticle(article)),
    pagination: {
      totalItems: count,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};

// get 1 articles by id
export const fetchArticleById = async (articleId) => {
  const article = await db.Article.findOne({
    where: { id: articleId },
    include: [
      {
        model: db.Category,
        as: 'category',
        attributes: ['name'],
      },
    ],
  });

  if (!article) {
    throw new ApiError('Không tìm thấy bài báo', 204);
  }

  return formatPublicArticle(article);
};

export const fetchAllComment = async (articleId, page, limit) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await db.Comment.findAndCountAll({
    where: { article_id: articleId },
    offset,
    limit,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: db.User,
        as: 'user',
        attributes: ['username', 'avatar_url'],
      },
    ],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    comments: rows.map((c) => formatCommentResponse(c)),
    pagination: {
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
      limit,
    },
  };
};

export const fetchRecommendArticles = async (articleId, recommendUrls) => {
  const articles = await db.Article.findAll({
    where: {
      source_url: { [Op.in]: recommendUrls },
      id: { [Op.ne]: articleId }, // khác id của bài đang đọc
    },
    include: [
      {
        model: db.Category,
        as: 'category',
        attributes: ['name'],
      },
    ],
  });

  if (!articles || articles.length === 0) {
    return [];
  }

  return articles.map((a) => formatPublicArticle(a));
};
