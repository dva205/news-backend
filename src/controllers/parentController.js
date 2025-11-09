import db from '../models/index.js';
import crypto from "crypto";


export const createAccountWithInviteLink = async (req, res) => {
    try {
        // create account
        const parentId = req?.user.id;

        const { username, firstName, lastName, dob, gender } = req.body;

        if (!username || !firstName || !lastName || !dob || !gender) {
            return res.status(400).json({
                EC: -1,
                EM: "Username, firstName, lastName, dob, gender không được để trống",
                DT: {}
            });
        }

        const existChild = await db.User.findOne({ where: { username } })

        if (existChild) {
            return res.status(400).json({
                EC: -1,
                EM: "Username đã tồn tại",
                DT: {}
            });
        }

        const newChild = await db.User.create({
            username,
            first_name: firstName,
            last_name: lastName,
            display_name: `${firstName} ${lastName}`,
            dob,
            gender,
            role: "CHILD",
            parent_id: parentId
        });

        // tạo code
        const code = crypto.randomBytes(16).toString('hex');

        const expires_at = Date.now() + 24 * 60 * 60 * 1000 //1d

        // redirect to child/signup
        const inviteUrl = `http://localhost:5173/child/auth/signup?invite=${code}`;

        // lưu code vào db
        const newInvite = await db.Invite.create({
            code,
            parent_id: parentId,
            child_id: newChild.id,
            used: false,
            expires_at
        })

        return res.status(200).json({
            EC: 0,
            EM: "Đăng kí cho con thành công",
            DT: {
                id: newChild.id,
                username: newChild.username,
                role: newChild.role,
                display_name: newChild.display_name,
                dob: newChild.dob,
                gender: newChild.gender,
                parent_id: parentId,
                newInvite,
                inviteUrl
            }
        });

    } catch (error) {
        console.log("Lỗi khi tạo tài khoản cho con", error)
        return res.status(500).json({
            EC: -1,
            EM: "Internal Server Error",
            DT: {}
        });
    }
}

export const getAllChild = async (req, res) => {
    try {
        // lấy id của parent
        const parentId = req?.user.id;


        // tìm trong db thằng con có parent id = parentId
        const children = await db.User.findAll({
            where: {
                parent_id: parentId,
                role: 'CHILD'
            }
        })


        if (!children || children.length === 0) {
            return res.status(404).json({
                EC: -1,
                EM: "You do not create any child account yet",
                DT: {}
            })
        }

        return res.status(200).json({
            EC: 0,
            EM: `You have ${children.length} ${children.length === 1 ? "child" : "children"}`,
            DT: { children }
        })
    } catch (error) {
        console.log("Lỗi khi xem tài khoản con", error)
        return res.status(500).json({
            EC: -1,
            EM: 'Server error',
            DT: {}
        })
    }
}

export const updateChildAccount = async (req, res) => {
    try {
        const childId = req.params.id;
        const parentId = req?.user?.id;

        if (!childId) {
            return res.status(400).json({
                EC: -1,
                EM: "Bạn cần chọn tài khoản con nào cần update",
                DT: {}
            })
        }

        if (!parentId) {
            return res.status(401).json({
                EC: -1,
                EM: "Unauthorized",
                DT: {}
            })
        }

        // tìm trong db thằng con có parent_id = parentId, id = id ở param
        const child = await db.User.findOne({
            where: {
                parent_id: parentId,
                id: childId,
                role: 'CHILD'
            }
        })

        if (!child) {
            return res.status(404).json({
                EC: -1,
                EM: "Bạn chưa có tài khoản con nào để update",
                DT: {}
            })
        }

        let { firstName, lastName, dob, gender } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({
                EC: -1,
                EM: "firstName và lastName không được để trống",
                DT: {}
            })
        }

        // update thằng con có childId = id ở db
        await child.update({
            first_name: firstName,
            last_name: lastName,
            display_name: `${firstName} ${lastName}`,
            dob,
            gender
        })

        return res.status(200).json({
            EC: 0,
            EM: "Cập nhật tài khoản con thành công",
            DT: {
                child
            }
        })

    } catch (error) {
        console.log("Lỗi khi update tài khoản con", error)
        return res.status(500).json({
            EC: -1,
            EM: "Server error",
            DT: {}
        })
    }
}

// TODO IF HAVE TIME
// export const deleteChildAccount = (req, res) => {
//     try {

//     } catch (error) {
//         console.log("Lỗi khi xóa tài khoản con", error)
//     }
// }

