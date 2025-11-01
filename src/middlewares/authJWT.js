

export const authJWT = (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        console.log("check token", token);
    } catch (error) {
        
    }
}