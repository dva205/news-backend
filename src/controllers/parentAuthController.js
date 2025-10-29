import bcrypt from 'bcrypt';
import db from '../models/index.js';

export const parentSignUp = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                EC: -1,
                EM: "Email, password, firstName, lastName must be not null",
                DT: {}
            });
        }

        const existEmail = await db.Parent.findOne({ where: { email } })

        if (existEmail) {
            return res.status(400).json({
                EC: -1,
                EM: "Email is already exist",
                DT: {}
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        await db.Parent.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: 1
        });

        return res.status(204).json({
            EC: 0,
            EM: "Sign up successfully",
            DT: {}
        });

    } catch (error) {
        console.log("Error while sign up", error);
        return res.status(500).json({
            EC: -1,
            EM: "Internal Server Error",
            DT: {}

        });
    }

}

export const parentSignIn = async (req, res) => {
    try {
        // lấy input

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                EC: -1,
                EM: "Email and password must be not null",
                DT: {}
            })
        }

        // lấy password db đã hash so sánh với input

        const existUser = await db.Parent.findOne({ where: { email } })

        if (!existUser) {
            return res.status(400).json({
                EC: -1,
                EM: "Email or password incorrect",
                DT: {}
            })
        }

        const isCorrectPassword = await bcrypt.compare(password, existUser.password);

        if (!isCorrectPassword) {
            return res.status(401).json({
                EC: -1,
                EM: "Email or password incorrect",
                DT: {}
            })
        }

        return res.status(204).json({
            EC: 0,
            EM: "Sign in successfully",
            DT: {}
        })

    } catch (error) {
        console.log("Error while sign up", error);
        return res.status(500).json({
            EC: -1,
            EM: "Internal Server Error",
            DT: {}

        });
    }

}

export const parentLogOut = () => {

}

