import db from '../models/index.js';
import crypto from "crypto";


export const createAccountWithInviteLink = async (req, res) => {
    try {
        // create account
        const parentId = req.user.id;

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
