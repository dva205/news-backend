import db from "../models/index.js";
import { handleUploadAudio } from "../utils/handleUpload.js";
import axios from "axios";
import {ApiError} from '../utils/ApiError.js';
import {sendError} from '../utils/ApiResponse.js'

export const saveAudioUrl = async (articleId, content) => {
    const article = await db.Article.findByPk(articleId);

    if (!article) {
        throw new ApiError("Không tìm thấy bài báo", 204);
    }

    // đã có audio_url ở database
    if (article.audio_url) {
        const audio = await axios.get(article.audio_url, {
            responseType: "arraybuffer"
        })

        console.log(audio)
        return {
            audioBuffer: Buffer.from(audio.data),
            audioUrl: article.audio_url
        }
    };

    // chưa có gọi voicerss
    const params = new URLSearchParams();
        params.append('key', process.env.VOICERSS_API_KEY);
        params.append('hl', 'vi-vn');
        params.append('c', 'MP3');
        params.append('src', content);

        const audio = await axios.post('http://api.voicerss.org/', params, {
            responseType: 'arraybuffer' ,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const audioBuffer = Buffer.from(audio.data);

        // upload cdn
        let audioUrl = null;
            if (audio) {
                try {
                    const b64 = audioBuffer.toString("base64")
                    const dataURI = "data:audio/mpeg;base64," + b64;
            
                    const cldRes = await handleUploadAudio(dataURI);
            
                    audioUrl = cldRes.secure_url;
                } catch (error) {
                    console.error("Lỗi khi upload audio lên cdn", error);
                        throw new ApiError('Lỗi upload audio lên cdn', 500)
                    }
                }

        await article.update({
            audio_url: audioUrl
        })

        return {
            audioBuffer,
            audioUrl
        }
}