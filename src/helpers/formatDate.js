export const formatDate = (isoString) => {
    if (!isoString) return ""; // Trả về rỗng nếu không có dữ liệu

    const date = new Date(isoString);

    // Check nếu ngày không hợp lệ (ví dụ chuỗi rác)
    if (isNaN(date.getTime())) return "";

    // Format theo chuẩn Việt Nam: ngày/tháng/năm
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};