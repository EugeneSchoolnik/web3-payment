import { ethers } from "ethers";
import { contractAddresses, ethersProviders } from "../../utils/web3/bsc";
import { addressPool, wallet } from "../../controllers/addressPool";
import db from "../../db/db";

export const findWallet = async (amount: number) => {
  const provider = ethersProviders.main;
  const tokenContract = new ethers.Contract(
    contractAddresses.main.USDT,
    ["function balanceOf(address owner) view returns (uint256)", "function decimals() view returns (uint8)"],
    provider
  );

  const decimals = await tokenContract.decimals();
  let total: { wallet: wallet; balance: number }[] = [];

  for (const i of addressPool) {
    const balance = await tokenContract.balanceOf(i.address);
    const formattedBalance = Number(ethers.utils.formatUnits(balance, decimals));

    total.push({ wallet: i, balance: formattedBalance });
    if (formattedBalance >= amount) return i;
  }

  const totalBalance = total.reduce((prev, curr) => {
    return prev + curr.balance;
  }, 0);
  if (totalBalance < amount) return "Owner of the service is not exactly an honest man";

  try {
    return await poolMoney(amount, total);
  } catch (e) {
    console.log(e);
    return "Error during token transaction";
  }
};

const poolMoney = async (amount: number, data: { wallet: wallet; balance: number }[]) => {
  data = data.sort((a, b) => b.balance - a.balance);

  let balance = 0,
    enoughIdx = 0;

  data.forEach((i, idx) => {
    if (balance < amount) balance += i.balance;
    else if (!enoughIdx) enoughIdx = idx;
  });

  for (let i = 1; i < enoughIdx; i++)
    await sendUSDT(data[i].wallet, data[0].wallet.address, data[i].balance.toString());

  return data[0].wallet;
};

export const sendUSDT = async (from: wallet, to: string, amount: string) => {
  const wallet = new ethers.Wallet(from.privateKey, ethersProviders.main);
  const tokenContract = new ethers.Contract(
    contractAddresses.main.USDT,
    ["function transfer(address to, uint amount) public returns (bool)", "function decimals() view returns (uint8)"],
    wallet
  );

  const decimals = await tokenContract.decimals();
  amount = amount.slice(0, 14);
  const amountInWei = ethers.utils.parseUnits(amount, decimals);
  const tx = await tokenContract.transfer(to, amountInWei);
  return await tx.wait();
};

export const getBalance = async (id: string) => {
  const result: any = (await db.execute("SELECT balance FROM users WHERE id = ?", [id]))[0][0];
  if (!result) return;

  return result.balance;
};
