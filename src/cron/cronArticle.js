import cron from 'node-cron';
import { downloadArticle, listPendingArticles, upsertArticleToDB } from '../services/articlesProcessor.js';


async function processArticle() {
    let files;
    // list file
    try {
        files = await listPendingArticles();
    } catch (error) {
        console.error(error);
        return;
    }

    if (!files || files.length === 0) {
        console.log("Không có file nào ở bucket");
        return;
    }

    files = files.filter(file => {
        return !file.name.startsWith('.');
    });

    console.log(`Tìm thấy ${files.length} files trong bucket`);

    // download + upsert file
    for (const file of files) {
        try {
            const articleBlob = await downloadArticle(file.name); // blob

            const articleText = await articleBlob.text(); // text

            if (!articleText || articleText.trim() === '') {
                console.log(`File ${file.name} rỗng, bỏ qua`);
                continue;
            }

            const articleData = JSON.parse(articleText); // json

            if (Array.isArray(articleData)) {
                for (const article of articleData) {
                    await upsertArticleToDB(article);
                }
            } else {
                await upsertArticleToDB(articleData);
            }
        } catch (error) {
            console.error(error)
        }
    }
}

export const cronArticle = () => {
    console.log('Starting to cron article')

    cron.schedule('* * * * *', () => {
        processArticle();
    });
}
