
export const getAccountController = (req, res) => {
    return res.status(200).json({
        EM: "",
        DT: req.user
    })
}