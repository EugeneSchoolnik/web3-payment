import { symbols } from "./data";

const getAmountInUSDT = async (symbol: symbols, amount: string) => {
  if (symbol == "USDT" || symbol == "USDC") return Number(amount);

  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`;
  const res = await (await fetch(url)).json();

  return Number(res.price) * Number(amount);
};

export default getAmountInUSDT;
