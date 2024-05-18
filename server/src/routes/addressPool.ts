import { Router } from "express";
import { newAddress } from "../controllers/addressPool";

const addressPool = Router()

addressPool.get("/new", newAddress)

export default addressPool
