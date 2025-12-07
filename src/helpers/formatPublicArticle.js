export const formatPublicArticle = (article) => {
    return {
        id: article.id,
        title: article.title,
        content: article.content,
        ageBucket: article.age_bucket || null,
        imageUrl: article.image_url || null,
        categoryName: article.category?.name,
        publishedAt: article.published_at,
        sourceUrl: article.source_url || null
    };
};