import { Router } from "express";
import { pay } from "../controllers/payment";

const payment = Router()

payment.get("/pay", pay)

export default payment
