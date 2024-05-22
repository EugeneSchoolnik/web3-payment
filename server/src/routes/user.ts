import { Router } from "express";
import { auth, getMe, login, logout, register } from "../controllers/user";

const user = Router();

user
  // routes
  .post("/register", register)
  .post("/login", login)
  .get("/me", auth, getMe)
  .get("/logout", logout);

export default user;
