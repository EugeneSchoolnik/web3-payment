import { ethers } from "ethers";
import { contractAddresses, ethersProviders } from "./src/utils/web3/bsc";
import { addressPool } from "./src/controllers/addressPool";

const provider = ethersProviders.main;
const wallet = new ethers.Wallet(addressPool[0].privateKey, provider);
const tokenContract = new ethers.Contract(
  contractAddresses.main.USDT,
  ["function transfer(address to, uint amount) public returns (bool)", "function decimals() view returns (uint8)"],
  wallet
);

const sendToken = async () => {
  try {
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.utils.parseUnits("0.05", decimals);
    const tx = await tokenContract.transfer(addressPool[1].address, amountInWei);
    const receipt = await tx.wait();
    console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};
sendToken();
