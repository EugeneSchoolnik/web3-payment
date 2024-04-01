import { Handler } from "../utils/express";
import { clientError, errorHandler } from "../utils/Error";
import { symbols } from "../services/payment/data";
import Payment from "../services/payment/paymentsHandler";

export const pay: Handler = async (req, res) => {
    try {
        const { symbol, amount, redirect } = req.query as { symbol: symbols, amount: string, redirect: string }

        if (!symbols.find(i => i == symbol)) throw clientError(404, "Query parameter symbol not found")
        if (amount == undefined) throw clientError(404, "Query parameter amount not found")
        if (redirect == undefined) throw clientError(404, "Query parameter redirect not found")

        const payment = Payment.newPayment(symbol, Number(amount), redirect, req.userId)

        res.status(201).json({ data: payment })

    } catch (e: any) {
        errorHandler(e, res)
    }
}
