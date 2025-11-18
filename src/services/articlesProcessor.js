import supabase from "../config/connectSupabase.js";
import { ApiError } from '../utils/ApiError.js';
import db from "../models/index.js";


const PENDING_BUCKET = process.env.BUCKET;


// list tất cả các file ở bucket
export const listPendingArticles = async () => {
    const { data, error } = await supabase
        .storage
        .from(PENDING_BUCKET)
        .list();
    if (error) throw new ApiError(`Lỗi khi list file từ bucket: ${error.message}`, 500);
    return data;
}

// tải nội dung  file
export const downloadArticle = async (fileName) => {
    const { data, error } = await supabase
        .storage
        .from(PENDING_BUCKET)
        .download(fileName)

    if (error) throw new ApiError(`Lỗi khi tải file từ bucket: ${error.message}`, 500);
    return data;
}

// upsert vào db
export const upsertArticleToDB = async (articleData) => {
    try {

        const [category, categoryCreated] = await db.Category.findOrCreate({
            where: { name: articleData.category },
            defaults: {
                name: articleData.category,
            },
        });

        if (categoryCreated) {
            console.log(` ${category.name}`)
        }

        const [record, created] = await db.Article.upsert({
            title: articleData.title,
            content: articleData.content,
            category_id: category.id,
            source_url: articleData.source_url,
            image_url: articleData.image_url,
            age_bucket: articleData.age_bucket,
            published_at: articleData.published_at,
        });

        // if (created) {
        //     console.log(`INSERT thành công: ${record.length}`);
        // } else {
        //     console.log(`UPDATE thành công: ${record.source_url}`);
        // }

        return record;

    } catch (error) {
        throw new ApiError(`Lỗi khi upsert báo vào db: ${error.message}`, 500);
    }
}



