import { Handler } from "../utils/express";
import { clientError, errorHandler } from "../utils/Error";
import { findWallet, getBalance, sendUSDT } from "../services/profile/withdraw";
import db from "../db/db";
import jwt from "jsonwebtoken";
import { setToken } from "./user";

export const withdraw: Handler = async (req, res) => {
  try {
    const { amount, address } = req.body;

    const balance = await getBalance(req.user.id);
    if (!balance) throw clientError(400, "Error get user balance");

    if (amount > balance) throw clientError(400, "Insufficient balance");
    if (amount < 10) throw clientError(400, "Minimum withdrawal amount 10 USDT");

    const wallet = await findWallet(amount);
    if (typeof wallet == "string") throw clientError(400, wallet);

    try {
      const tx = await sendUSDT(wallet, address, amount.toString());

      const result: any = await db.execute("UPDATE users SET balance = ? WHERE id = ?", [
        balance - amount,
        req.user.id,
      ]);
      if (result[0] && result[0].affectedRows == 0) console.log("Error updating a user balance", req.user.id, -amount);

      res.json({ data: tx.transactionHash });
    } catch {
      throw clientError(400, "Error sending a transaction");
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

export const getUserBalance: Handler = async (req, res) => {
  try {
    req.user.balance = await getBalance(req.user.id);
    if (!req.user.balance) throw clientError(400, "Error get user balance");

    req.user.balance = Math.floor(req.user.balance * 10 ** 2) / 10 ** 2;

    const token = jwt.sign(req.user, Bun.env.JWT_SECRET);
    setToken(res, token, 5 * 24 * 60 * 60 * 1000);

    res.json({ data: req.user.balance });
  } catch (e) {
    errorHandler(e, res);
  }
};
