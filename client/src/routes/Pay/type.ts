export type symbols = "BTC" | "ETH" | "USDT" | "BNB" | "XRP";

export interface IPayment {
  id: string;
  amount: number;
  amountInUSDT: number;
  symbol: symbols;
  address: string;
  userId: string;
  redirect: string;
  until: number;
  network: "main" | "test";
}
