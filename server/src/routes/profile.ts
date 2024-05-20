import { Router } from "express";
import { auth } from "../controllers/user";
import { getUserBalance, withdraw } from "../controllers/profile";

const profile = Router();

profile.get("/balance", auth, getUserBalance);
profile.post("/withdraw", auth, withdraw);

export default profile;
