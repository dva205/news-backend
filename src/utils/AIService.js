import axios from 'axios';

axios.defaults.headers.post['Content-Type'] = 'application/json';

export const checkBadWord = async (content) => {
  try {
    const res = await axios.post('https://rosette-monumentless-preacquisitively.ngrok-free.dev/filter', {
      text: content,
      strict_mode: true,
    });

    if (res?.data?.action === 'BAN') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi check từ khóa bị chặn', error);
    return false;
  }
};

export const searchArticle = async (search) => {
  try {
    const res = await axios.post('https://euphoniously-ridgier-golden.ngrok-free.dev/search', {
      query: search,
      top_n: 4, // số kết quả
      top_k_lex: 1000,
    });

    const articles = res.data?.results || [];

    return articles;
  } catch (error) {
    console.error('Lỗi khi gọi search AI model', error);
    return [];
  }
};

export const recommendArticle = async (content) => {
  try {
    const res = await axios.post('https://biometric-unclimbed-jayden.ngrok-free.dev/recommend', {
      text: content,
      top_k: 5, // số kết quả
    });

    return res.data?.results || [];
  } catch (error) {
    console.error('Lỗi khi gọi recommend AI model', error);
    return [];
  }
};
