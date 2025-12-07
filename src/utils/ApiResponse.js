export const sendSuccess = (res, data, message = 'Success', statusCode) => {
    return res.status(statusCode).json({
        success: true,
        message,
        statusCode,
        data: data || null
    });
};

export const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    return res.status(statusCode).json({
        success: false,
        message,
        statusCode,
        data: null
    });
};

