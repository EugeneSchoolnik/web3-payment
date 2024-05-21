import { Router } from "express";
import { get, pay } from "../controllers/payment";

const payment = Router();

payment.get("/pay", pay);

payment.get("/get", get);

export default payment;
