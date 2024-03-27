import Web3 from "web3";
import RPC from "./RPC.json"

export const web3 = {
    main: new Web3(RPC.bsc.main),
    test: new Web3(RPC.bsc.test)
}
