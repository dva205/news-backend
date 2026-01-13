import { sendError } from '../utils/ApiResponse.js';
import { saveAudioUrl } from '../services/textToSpeechService.js';

export const textToSpeech = async (req, res) => {
  try {
    const { content, articleId } = req.body;

    if (!content) {
      return sendError(res, {
        statusCode: 404,
        message: 'Thiếu nội dung bài báo',
      });
    }

    if (!articleId) {
      return sendError(res, {
        statusCode: 404,
        message: 'Thiếu id bài báo',
      });
    }

    const data = await saveAudioUrl(articleId, content);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', data.audioBuffer.length);
    return res.send(data.audioBuffer);
  } catch (error) {
    console.error('Lỗi khi conver tts', error);
    return sendError(res, error);
  }
};
