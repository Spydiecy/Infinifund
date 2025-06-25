import Web3 from "web3"
import ABI from "../ABI.json"
import { AbiItem } from 'web3-utils';

const fetchContract=():any=>{
    let  contract;
    let web3;
    if (typeof window !== "undefined") {
      web3 = new Web3(window.ethereum)
      const contractAdd=localStorage.getItem("CONTRACT_ADD");
      console.log("My Contract address from Navbar is:::",contractAdd);  
      const formattedABI: AbiItem[] = JSON.parse(JSON.stringify(ABI));
      contract = new web3.eth.Contract(formattedABI, contractAdd)
      return contract;
    }
}
export default fetchContract