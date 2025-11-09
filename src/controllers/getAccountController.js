
export const getAccountController = (req, res) => {
    return res.status(200).json({
        EC: 0,
        EM: "",
        DT: req.user
    })
}