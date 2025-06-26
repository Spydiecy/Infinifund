import Web3 from "web3"
import ABI from "../../lib/abi.json"
import { AbiItem } from 'web3-utils'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xbc29335737795E7E6839882D1aF663e21Db0E736"

const fetchContract = () => {
  // Use Flow EVM Testnet RPC directly, no window.ethereum dependency
  const web3 = new Web3('https://testnet.evm.nodes.onflow.org')
  
  const contract = new web3.eth.Contract(ABI as AbiItem[], CONTRACT_ADDRESS)
  return contract
}

export default fetchContract
