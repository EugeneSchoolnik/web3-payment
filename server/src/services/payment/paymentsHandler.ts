import uniqid from "uniqid"
import { addressPool } from "../../controllers/addressPool";
import { IPayment, symbols } from "./data";

class Payment {
    static payments: IPayment[] = []

    static newPayment(symbol: symbols, amount: number, redirect: string, userId: string) {
        const used = Payment.payments.filter(i => i.symbol == symbol && i.amount == amount).map(i => i.address)
        const address = addressPool.find(i => !used.includes(i))

        if (!address) return "No available addresses"

        const id = uniqid.time()

        const payment: IPayment = {
            id, amount, symbol, address, userId, redirect, until: Date.now() + 30 * 60 * 1000
        }

        Payment.payments.push(payment)

        return payment
    }
}

export default Payment
