import { Router } from "express";
import { get, pay, paymentHistory } from "../controllers/payment";
import { auth } from "../controllers/user";

const payment = Router();

payment.get("/pay", pay);

payment.get("/get", get);

payment.get("/history", auth, paymentHistory);

export default payment;
