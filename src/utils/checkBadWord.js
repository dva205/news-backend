import axios from "axios";

axios.defaults.baseURL = 'https://biometric-unclimbed-jayden.ngrok-free.dev';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export const checkBadWord = async (content) => {
    try {
        const res = await axios.post('/filter', {
            text: content,
            strict_mode: true
        })

        if (res?.data?.action === 'BAN') {
            return false
        }

        return true;
    } catch (error) {
        console.error("Lỗi khi check từ khóa bị chặn", error);
        return false;
    }
}

