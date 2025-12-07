export const safeParseJSON = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
    } catch (e) {
        return [data];
    }
};

export const formatArticleResponse = (article, isSaved = false) => {
    // Nếu article lấy từ bảng SavedArticle (bị lồng bên trong)
    const data = article.article ? article.article : article;

    return {
        id: data.id,
        title: data.title,
        content: data.content,
        imageUrl: data.image_url,
        ageBucket: data.age_bucket || null,
        categoryName: data.category?.name,
        publishedAt: data.published_at,
        sourceUrl: data.source_url || null,
        isSaved: isSaved || false // Flag quan trọng cho FE
    };
};

export const formatCommentResponse = (comment) => {
    return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
            username: comment.user?.username || "Ẩn danh",
            avatarUrl: comment.user?.avatar_url || null
        }
    };
};