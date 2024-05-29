import uniqid from "uniqid";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Handler } from "../utils/express";
import { clientError, errorHandler } from "../utils/Error";
import db from "../db/db";
import { Response } from "express";
import { IUser } from "../services/user/interface";
import Jimp from "jimp";
import { join } from "path";

export const setToken = (res: Response, token: string, maxAge: number) => {
  res.cookie("authorization", token, { httpOnly: true, maxAge });
};

export const register: Handler = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    if (!verifyCaptcha(captcha.hash, captcha.x)) throw clientError(409, "Invalid captcha");

    const exist = (await db.execute("SELECT * FROM users WHERE email = ?", [email]))[0][0];
    if (exist) throw clientError(409, "Email already in use");

    const id = uniqid.time();
    const hash = await Bun.password.hash(password, "bcrypt");

    const [result]: any = await db.execute("INSERT INTO users (id, email, password) VALUES (?, ?, ?)", [
      id,
      email,
      hash,
    ]);
    if (result && result.affectedRows !== 1) throw clientError(500, "Registration error");

    const user: IUser = { id, email, balance: 0 };
    const token = jwt.sign(user, Bun.env.JWT_SECRET, { expiresIn: "5d" });

    setToken(res, token, 5 * 24 * 60 * 60 * 1000);
    res.status(201).json(user);
  } catch (e: any) {
    errorHandler(e, res);
  }
};

export const login: Handler = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    if (!verifyCaptcha(captcha.hash, captcha.x)) throw clientError(409, "Invalid captcha");

    const result = (await db.execute("SELECT * FROM users WHERE email = ?", [email]))[0][0];

    if (!result) throw clientError(404, "User not found");
    if (!(await Bun.password.verify(password, result.password))) throw clientError(401, "Invalid password");

    const user: IUser = { id: result.id, email, balance: result.balance };
    const token = jwt.sign(user, Bun.env.JWT_SECRET, { expiresIn: "5d" });

    setToken(res, token, 5 * 24 * 60 * 60 * 1000);
    res.status(200).json(user);
  } catch (e: any) {
    errorHandler(e, res);
  }
};

export const getMe: Handler = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (e: any) {
    errorHandler(e, res);
  }
};

export const auth: Handler = async (req, res, next) => {
  try {
    const token = req.cookies.authorization;
    if (!token) throw clientError(401, "Token expired");

    try {
      const user = jwt.verify(token, Bun.env.JWT_SECRET) as IUser;
      req.user = user;

      next();
    } catch {
      throw clientError(401, "Token expired");
    }
  } catch (e: any) {
    errorHandler(e, res);
  }
};

export const logout: Handler = async (req, res) => {
  try {
    setToken(res, "", 0);
    res.send();
  } catch (e: any) {
    errorHandler(e, res);
  }
};

export const captcha: Handler = async (req, res) => {
  try {
    const captcha = await generateCaptcha();
    const hash = jwt.sign({ x: captcha.coords.x }, Bun.env.JWT_SECRET, { expiresIn: "5m" });

    res.json({
      puzzleBackground: `data:image/jpeg;base64,${captcha.background.toString("base64")}`,
      puzzlePiece: `data:image/png;base64,${captcha.puzzle.toString("base64")}`,
      data: { hash, y: captcha.coords.y },
    });
  } catch (e) {
    errorHandler(e, res);
  }
};

export const checkCaptcha: Handler = async (req, res) => {
  try {
    const { hash, x } = req.body;

    res.json(verifyCaptcha(hash, x));
  } catch (e) {
    errorHandler(e, res);
  }
};

const backgroundImagePath = join(__dirname, "..", "..", "img", "1.jpg");

const generateCaptcha = async () => {
  const backgroundImage = await Jimp.read(backgroundImagePath);

  const puzzlePieceSize = { width: 80, height: 80 };

  const x = Math.floor(Math.random() * (backgroundImage.bitmap.width - puzzlePieceSize.width - 100)) + 100;
  const y = Math.floor(Math.random() * (backgroundImage.bitmap.height - puzzlePieceSize.height - 300)) + 150;

  const puzzleBackground = backgroundImage.clone();
  const puzzleCutOut = backgroundImage.clone().crop(x, y, puzzlePieceSize.width, puzzlePieceSize.height);

  puzzleBackground.scan(x, y, puzzlePieceSize.width, puzzlePieceSize.height, (px, py, idx) => {
    puzzleBackground.bitmap.data[idx + 3] = 50; // A
  });

  const puzzleBackgroundBuffer = await puzzleBackground.getBufferAsync(Jimp.MIME_PNG);
  const puzzlePieceBuffer = await puzzleCutOut.getBufferAsync(Jimp.MIME_PNG);

  return {
    background: puzzleBackgroundBuffer,
    puzzle: puzzlePieceBuffer,
    coords: { x, y },
  };
};

const verifyCaptcha = (hash: string, x: number) => {
  try {
    const data = jwt.verify(hash, Bun.env.JWT_SECRET) as JwtPayload;
    const validX = data.x;

    return Math.abs(validX - x) <= 10;
  } catch {
    return false;
  }
};
