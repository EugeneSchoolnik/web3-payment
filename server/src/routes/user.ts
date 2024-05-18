import { Router } from "express";
import { auth, getMe, login, register } from "../controllers/user";

const user = Router();

user.post("/register", register);

user.post("/login", login);

user.get("/me", auth, getMe);

export default user;
