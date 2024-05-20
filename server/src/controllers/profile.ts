import { Handler } from "../utils/express";
import { clientError, errorHandler } from "../utils/Error";
import { findWallet, getBalance, sendUSDT } from "../services/profile/withdraw";
import db from "../db/db";

export const withdraw: Handler = async (req, res) => {
  try {
    const { amount, address } = req.body;

    const balance = await getBalance(req.user.id);
    if (!balance) throw clientError(400, "Error get user balance");

    if (amount > balance) throw clientError(400, "Insufficient balance");

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
    let balance = await getBalance(req.user.id);
    if (!balance) throw clientError(400, "Error get user balance");

    balance = Math.floor(balance * 10 ** 2) / 10 ** 2;

    res.json({ data: balance });
  } catch (e) {
    errorHandler(e, res);
  }
};
