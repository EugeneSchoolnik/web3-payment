import RPC from "./RPC.json"
import ContractAddresses from "./conractAddresses.json"
import { ethers } from "ethers";

export const ethersProviders = {
    test: new ethers.providers.JsonRpcProvider(RPC.bsc.test),
    main: new ethers.providers.JsonRpcProvider(RPC.bsc.main),
}

export const contractAddresses = ContractAddresses
