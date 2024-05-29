import { Router } from "express";
import { auth, captcha, checkCaptcha, getMe, login, logout, register } from "../controllers/user";

const user = Router();

user
  // routes
  .post("/register", register)
  .post("/login", login)
  .get("/me", auth, getMe)
  .get("/logout", logout)
  .get("/captcha", captcha)
  .post("/captcha", checkCaptcha);

export default user;
