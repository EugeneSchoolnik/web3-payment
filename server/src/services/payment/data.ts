export type symbols = "BTC" | "ETH" | "USDT" | "BNB" | "SOL" | "XRP" | "USDC"
export const symbols: symbols[] = ["BTC", "ETH", "USDT", "BNB", "SOL", "XRP", "USDC"]

export interface IPayment {
    id: string
    amount: number
    symbol: symbols
    address: string
    userId: string
    redirect: string
    until: number
}
