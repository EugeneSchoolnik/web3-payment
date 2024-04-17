import { Handler } from "../utils/express";
import { clientError, errorHandler } from "../utils/Error";
import { symbols } from "../services/payment/data";
import Payment from "../services/payment/paymentsHandler";
import getAmountInUSDT from "../services/payment/getPaymentAmount";

export const pay: Handler = async (req, res) => {
  try {
    const { symbol, amount, redirect, userId, network } = req.query as Record<string, string> & { symbol: symbols };

    if (!symbols.find((i) => i == symbol)) throw clientError(404, "Query parameter symbol not found");
    if (amount == undefined) throw clientError(404, "Query parameter amount not found");
    if (redirect == undefined) throw clientError(404, "Query parameter redirect not found");
    if (userId == undefined) throw clientError(404, "Query parameter userId not found");
    if (network !== "main" && network !== "test") throw clientError(400, "Invalid network");

    const amountInUSDT = await getAmountInUSDT(symbol, amount);
    if (amountInUSDT < 1 || amountInUSDT > 5000) throw clientError(400, "Payment amount should be from $1 to $5000");

    const payment = await Payment.new(symbol, Number(amount), redirect, userId, network);

    if (typeof payment === "string") throw clientError(400, payment);

    res.status(201).json({ data: payment });
  } catch (e: any) {
    errorHandler(e, res);
  }
};
