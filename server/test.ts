import { ethersProviders } from "./src/utils/web3/bsc";

const provider = ethersProviders.main;

provider.on("block", async (number) => {
  const { transactions } = await provider.getBlockWithTransactions(number);

  for (const tx of transactions) {
    if (tx.to && tx.to.toLowerCase() == "0x0929D6c131722388aD54962e9F19Dcbf5eEe53f9".toLowerCase()) {
      console.log(null, tx.to, tx.value, tx);
    }
  }
});
