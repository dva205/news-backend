// Helper 1: Lấy StartDate và EndDate dựa trên range
export const getDateRange = (range) => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0]; // Lấy ngày hiện tại YYYY-MM-DD
    let startDate = new Date(today);

    switch (range) {
        case 'today':
            // Start và End giống nhau
            startDate = endDate;
            break;
        case 'week':
            // Lấy 7 ngày gần nhất (tính cả hôm nay là trừ đi 6)
            startDate.setDate(today.getDate() - 6);
            break;
        case 'month':
            // Lấy 30 ngày gần nhất
            startDate.setDate(today.getDate() - 29);
            break;
        default:
            return null; // Invalid range
    }

    // Convert startDate về string YYYY-MM-DD
    return {
        startDate: typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0],
        endDate
    };
};

// Helper 2: Điền dữ liệu vào các ngày bị thiếu (Zero-filling)
export const fillMissingDates = (dbData, startDateStr, endDateStr) => {
    const result = [];
    const current = new Date(startDateStr);
    const end = new Date(endDateStr);

    // 1. Tạo Map từ dữ liệu DB để tra cứu cho nhanh
    // Dạng: { '2023-12-10': 1500, '2023-12-12': 300 }
    const dataMap = {};
    dbData.forEach(item => {
        dataMap[item.session_date] = Number(item.total_seconds);
    });

    // 2. Vòng lặp từ ngày bắt đầu đến ngày kết thúc
    while (current <= end) {
        const dateString = current.toISOString().split('T')[0];

        // Nếu có dữ liệu trong Map thì lấy, không thì bằng 0
        const totalSeconds = dataMap[dateString] || 0;

        result.push({
            date: dateString,
            minutes: Math.floor(totalSeconds / 60),
            hours: parseFloat((totalSeconds / 3600).toFixed(2))
        });

        // Tăng thêm 1 ngày
        current.setDate(current.getDate() + 1);
    }

    return result;
};