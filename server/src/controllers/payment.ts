import { Handler } from "../utils/express";
import { clientError, errorHandler } from "../utils/Error";
import { symbols } from "../services/payment/data";
import Payment from "../services/payment/paymentsHandler";
import { getAmountInSymbol } from "../services/payment/getPaymentAmount";

export const pay: Handler = async (req, res) => {
  try {
    const { symbol, amount, redirect, userId, network } = req.query as Record<string, string> & { symbol: symbols };

    if (!symbols.find((i) => i == symbol)) throw clientError(404, "Query parameter symbol not found");
    if (amount == undefined) throw clientError(404, "Query parameter amount not found");
    if (redirect == undefined) throw clientError(404, "Query parameter redirect not found");
    if (userId == undefined) throw clientError(404, "Query parameter userId not found");
    if (network !== "main" && network !== "test") throw clientError(400, "Invalid network");

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
