import uniqid from "uniqid";
import { ethers } from "ethers";
import { addressPool } from "../../controllers/addressPool";
import { IPayment, paymentStatus, paymentTime, symbols } from "./data";
import { contractAddresses, ethersProviders } from "../../utils/web3/bsc";
import db from "../../db/db";
import { swap } from "./swap";

class Payment {
  static payments: IPayment[] = [];

  static async new(
    symbol: symbols,
    amount: number,
    amountInUSDT: number,
    redirect: string,
    userId: string,
    network: "main" | "test"
  ) {
    const inUse = Payment.payments.filter((i) => i.symbol == symbol && i.amount == amount).map((i) => i.address);
    const address = addressPool.find((i) => !inUse.includes(i.address)).address;

    if (!address) return "No available addresses";

    const id = uniqid.time();
    const [result]: any = await db.execute("INSERT INTO orders (id, userId, symbol, status) VALUES (?, ?, ?, ?)", [
      id,
      userId,
      symbol,
      paymentStatus.pending,
    ]);
    if (result && result.affectedRows !== 1) return "Database entry error";

    const payment: IPayment = {
      id,
      amount,
      amountInUSDT,
      symbol,
      address,
      userId,
      redirect,
      until: Date.now() + paymentTime[symbol] * 60 * 1000,
      network,
    };
    Payment.payments.push(payment);
    this.watch(payment);

    return payment;
  }

  static async watch(payment: IPayment) {
    const provider = ethersProviders[payment.network];
    const contractAddress = contractAddresses[payment.network][payment.symbol];

    const contract = new ethers.Contract(
      contractAddress,
      ["event Transfer(address indexed from, address indexed to, uint256 value)"],
      provider
    );

    const listener: ethers.providers.Listener = async (_, to, value, e) => {
      if (to && to.toLowerCase() === payment.address.toLowerCase()) {
        if (Number(ethers.utils.formatUnits(value)) === payment.amount) {
          Payment.payments = Payment.payments.filter((i) => i.id !== payment.id);
          swap(payment);

          const result: any = await db.execute("UPDATE orders SET txHash = ?, status = ? WHERE id = ?", [
            e.transactionHash || e.hash,
            paymentStatus.success,
            payment.id,
          ]);
          if (result[0] && result[0].affectedRows == 0) console.log("Error updating a successful order");

          await Payment.updateUserBalance(payment);

          if (onBlock) provider.off("block", onBlock);
          else contract.off("Transfer", listener);
        }
      }
    };

    const onBlock = payment.symbol == "BNB" ? await Payment.watchMainCurrency(provider, listener) : null;

    if (onBlock) provider.on("block", onBlock);
    else contract.on("Transfer", listener);

    this.checkPaymentTime(payment, async () => {
      Payment.payments = Payment.payments.filter((i) => i.id !== payment.id);

      if (onBlock) provider.off("block", onBlock);
      else contract.off("Transfer", listener);

      const result: any = await db.execute("UPDATE orders SET status = ? WHERE id = ?", [
        paymentStatus.canceled,
        payment.id,
      ]);
      if (result[0] && result[0].affectedRows == 0) console.log("Error updating a successful order");
    });
  }

  static async watchMainCurrency(provider: ethers.providers.JsonRpcProvider, listener: ethers.providers.Listener) {
    const onBlock = async (number) => {
      const { transactions } = await provider.getBlockWithTransactions(number);

      for (const tx of transactions) listener(tx.from, tx.to, tx.value, tx);
    };

    return onBlock;
  }

  static checkPaymentTime(payment: IPayment, callback: () => void) {
    const getDelta = () => payment.until - Date.now();

    const checker = async () => {
      const delta = getDelta();
      if (delta > 0) return setTimeout(checker, Math.max(delta / 2, 15000));

      const { status } = (await db.execute("SELECT status FROM orders WHERE id = ?", [payment.id]))[0][0];
      if (status !== "success") callback();
    };

    setTimeout(checker, getDelta() / 2);
  }

  static async updateUserBalance(payment: IPayment) {
    const fee = payment.symbol == "USDT" ? 0.005 : 0.015;
    const amountFee = Math.max(payment.amountInUSDT * fee, 0.5);
    const amount = Math.round((payment.amountInUSDT - amountFee) * 10 ** 4) / 10 ** 4;

    const result: any = await db.execute("UPDATE users SET balance = balance + ? WHERE id = ?", [
      amount,
      payment.userId,
    ]);
    if (result[0] && result[0].affectedRows == 0) console.log("Error updating a user balance", payment.userId, amount);
  }
}

export default Payment;
