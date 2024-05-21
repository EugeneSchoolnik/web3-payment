import { Handler } from "../utils/express";
import { clientError, errorHandler } from "../utils/Error";
import { symbols } from "../services/payment/data";
import Payment from "../services/payment/paymentsHandler";
import { getAmountInSymbol } from "../services/payment/getPaymentAmount";
import db from "../db/db";
import { ethersProviders } from "../utils/web3/bsc";

export const pay: Handler = async (req, res) => {
  try {
    const { symbol, amount, redirect, userId, network } = req.query as Record<string, string> & { symbol: symbols };

    if (!symbols.find((i) => i == symbol)) throw clientError(404, "Query parameter symbol not found");
    if (amount == undefined) throw clientError(404, "Query parameter amount not found");
    if (redirect == undefined) throw clientError(404, "Query parameter redirect not found");
    if (userId == undefined) throw clientError(404, "Query parameter userId not found");
    if (network !== "main" && network !== "test") throw clientError(400, "Invalid network");

    const userExist = (await db.execute("SELECT 1 FROM users WHERE id = ?", [userId]))[0][0];
    if (!userExist) throw clientError(404, "User not found");

    const Amount = Number(amount);
    if (isNaN(Amount))
      throw clientError(400, 'Amount isn\'t number, if you are specifying a non-integer number, use "."');
    if (Amount < 1 || Amount > 5000) throw clientError(400, "Payment amount should be from $1 to $5000");

    const amountInSymbol = await getAmountInSymbol(symbol, amount);
    const payment = await Payment.new(symbol, amountInSymbol, Amount, redirect, userId, network);

    if (typeof payment === "string") throw clientError(400, payment);

    res.status(201).json({ data: payment });
  } catch (e: any) {
    errorHandler(e, res);
  }
};

export const get: Handler = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) throw clientError(409, "Required query param 'id'");

    const payment = (await db.execute("SELECT * FROM orders WHERE id = ?", [id]))[0][0];
    if (!payment) throw clientError(404, "Payment not found");

    const tx = await ethersProviders.main.getTransaction(payment.txHash);
    const block = await ethersProviders.main.getBlock(tx.blockNumber);

    payment.timestamp = block.timestamp;

    res.json(payment);
  } catch (e) {
    errorHandler(e, res);
  }
};
