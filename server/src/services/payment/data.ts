export type symbols = "BTC" | "ETH" | "USDT" | "BNB" | "SOL" | "XRP" | "USDC";
export const symbols: symbols[] = ["BTC", "ETH", "USDT", "BNB", "SOL", "XRP", "USDC"];

export const paymentTime: Record<symbols, number> = {
  // minutes
  BTC: 15,
  ETH: 15,
  USDT: 30,
  BNB: 15,
  SOL: 15,
  XRP: 15,
  USDC: 30,
};

export interface IPayment {
  id: string;
  amount: number;
  symbol: symbols;
  address: string;
  userId: string;
  redirect: string;
  until: number;
  network: "main" | "test";
}

export enum paymentStatus {
  success = "success",
  pending = "pending",
  canceled = "canceled",
}
