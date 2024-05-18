import { symbols } from "./data";

export const getAmountInSymbol = async (symbol: symbols, amount: string) => {
  if (symbol == "USDT") return Number(amount);

  const { price } = await (await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`)).json();
  const exchangeInfo = await (await fetch(`https://api.binance.com/api/v3/exchangeInfo?symbol=${symbol}USDT`)).json();

  const stepSize = exchangeInfo.symbols[0].filters[1].stepSize;

  let precision = stepSize.indexOf("1") - 1;
  precision = precision < 0 ? 0 : precision;

  const Amount = Math.ceil((Number(amount) / Number(price)) * 10 ** precision) / 10 ** precision;

  return Amount;
};
