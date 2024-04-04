import uniqid from "uniqid"
import jwt, { JwtPayload } from "jsonwebtoken"
import { Handler } from "../utils/express";
import { clientError, errorHandler } from "../utils/Error";
import db from "../db";
import { Response } from "express";
import { IUser } from "../services/user/interface";

const setToken = (res: Response, token: string, maxAge: number) => {
    res.cookie("authorization", token, { httpOnly: true, maxAge });
}

export const register: Handler = async (req, res) => {
    try {
        const { email, password } = req.body

        const exist = (await db.execute("SELECT * FROM users WHERE email = ?", [email]))[0][0]
        if (exist) throw clientError(409, "Email already in use")

        const id = uniqid.time()
        const hash = await Bun.password.hash(password, "bcrypt")

        const [result]: any = await db.execute("INSERT INTO users (id, email, password) VALUES (?, ?, ?)", [id, email, hash])
        if (result && result.affectedRows !== 1) throw clientError(500, "Registration error")

        const user: IUser = { id, email };
        const token = jwt.sign(user, Bun.env.JWT_SECRET, { expiresIn: "5d" })

        setToken(res, token, 5 * 24 * 60 * 60 * 1000)
        res.status(201).json({ data: { user } })

    } catch (e: any) {
        errorHandler(e, res)
    }
}

export const login: Handler = async (req, res) => {
    try {
        const { email, password } = req.body

        const result = (await db.execute("SELECT * FROM users WHERE email = ?", [email]))[0][0]

        if (!result) throw clientError(404, "User not found")
        if (!await Bun.password.verify(password, result.password)) throw clientError(401, "Invalid password")

        const user: IUser = { id: result.id, email };
        const token = jwt.sign(user, Bun.env.JWT_SECRET, { expiresIn: "5d" })

        setToken(res, token, 5 * 24 * 60 * 60 * 1000)
        res.status(200).json({ data: { user } })

    } catch (e: any) {
        errorHandler(e, res)
    }
}

export const getMe: Handler = async (req, res) => {
    try {
        res.status(200).json({ data: { user: req.user } })
    } catch (e: any) {
        errorHandler(e, res)
    }
}

export const auth: Handler = async (req, res, next) => {
    try {
        const token = req.cookies.authorization;
        if (!token) throw clientError(401, "Token expired")

        try {
            const { id, email } = jwt.verify(token, Bun.env.JWT_SECRET) as IUser
            req.user = { id, email }

            next()
        } catch {
            throw clientError(401, "Token expired")
        }

    } catch (e: any) {
        errorHandler(e, res)
    }
}