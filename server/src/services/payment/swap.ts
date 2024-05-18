import { ethers } from "ethers";
import { IPayment } from "./data";
import { addressPool } from "../../controllers/addressPool";
import { contractAddresses, ethersProviders } from "../../utils/web3/bsc";

const PANCAKE_ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

export const swap = async (payment: IPayment) => {
  if (payment.symbol == "USDT" || payment.network == "test") return;

  const provider = ethersProviders.main;
  const tokenInAddress =
    payment.symbol == "BNB" ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" : contractAddresses.main[payment.symbol];

  const privateKey = addressPool.find((i) => i.address == payment.address).privateKey;
  const wallet = new ethers.Wallet(privateKey, provider);
  const account = wallet.connect(provider);

  const router = new ethers.Contract(
    PANCAKE_ROUTER_ADDRESS,
    [
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    ],
    account
  );

  const tokenInContract = new ethers.Contract(
    tokenInAddress,
    ["function approve(address spender, uint amount) public returns(bool)"],
    account
  );

  await approve(payment.amount.toString());

  try {
    const slippage = 5; // 5% slippage tolerance
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10m
    const path = [tokenInAddress, USDT_ADDRESS];
    const amountIn = ethers.utils.parseUnits(payment.amount.toString(), "ether");

    const amounts = await router.getAmountsOut(amountIn, path);
    const amountOutMin = amounts[1].mul(100 - slippage).div(100);

    const tx =
      payment.symbol == "BNB"
        ? await router.swapExactETHForTokens(amountOutMin, path, account.address, deadline, {
            value: amountIn,
            gasPrice: provider.getGasPrice(),
            gasLimit: ethers.utils.hexlify(300000),
          })
        : await router.swapExactTokensForTokens(amountIn, amountOutMin, path, account.address, deadline, {
            gasPrice: provider.getGasPrice(),
            gasLimit: ethers.utils.hexlify(300000),
          });

    await tx.wait();
  } catch (e) {
    console.log(e);
  }

  async function approve(amount: string) {
    const valueToapprove = ethers.utils.parseUnits(amount, "ether");
    const tx = await tokenInContract.approve(router.address, valueToapprove, {
      gasPrice: provider.getGasPrice(),
      gasLimit: ethers.utils.hexlify(100000),
    });
    // Approving...
    await tx.wait();
  }
};
