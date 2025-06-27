import Web3 from "web3"
import ABI from "../../lib/abi.json"
import { AbiItem } from 'web3-utils'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xbc29335737795E7E6839882D1aF663e21Db0E736"

const fetchContract = () => {
  // Use Base Sepolia RPC directly, no window.ethereum dependency
  const web3 = new Web3('https://rpc.ankr.com/base_sepolia/8cd8e951cc28ebd329a4f5281020c4ffc1124d8db2a1aa415b823972e5edbc24')
  
  const contract = new web3.eth.Contract(ABI as AbiItem[], CONTRACT_ADDRESS)
  return contract
}

export default fetchContract
