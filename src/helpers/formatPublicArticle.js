import { formatDate } from './formatDate.js'

export const formatPublicArticle = (article) => {
    return {
        id: article.id,
        title: article.title,
        content: article.content,
        ageBucket: article.age_bucket || null,
        imageUrl: article.image_url || null,
        categoryName: article.category?.name,
        categoryId: article.category?.id,
        publishedAt: formatDate(article.published_at) || null,
        sourceUrl: article.source_url || null,
        audioUrl: article.audio_url || null
    };
};