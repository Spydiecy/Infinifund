"use client"
import React, { useEffect, useState } from 'react'
import { BentoGridDemo } from './My-builds'
import Web3 from "web3"
import ABI from "../ABI.json";
import { TypewriterEffectSmoothDemo } from './effect'
import { AbiItem } from 'web3-utils';
import fetchContract from '../components/fetchContract';
let  contract=fetchContract();
let web3;
if (typeof window !== "undefined") {
   web3 = new Web3(window.ethereum)
}
const page = () => {
  const [build_data, setBuild_data] = useState([])
  const fetch_data=async ()=>{
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    const userAddress = accounts[0]
    const build_arr=await contract.methods.getallbuilds().call({from:userAddress});
    console.log("My Build Array is:::::",build_arr);
    setBuild_data(build_arr)
  }
  useEffect(() => {
    
   fetch_data();
  }, [])
  
  return (
    <div className='pt-24 pt-5'>
      <TypewriterEffectSmoothDemo></TypewriterEffectSmoothDemo>
      {build_data.length!=0 &&
      <BentoGridDemo props={build_data}></BentoGridDemo>
      }
      {
        build_data.length==0 && 
        <div>
          <center className='text-4xl mt-24'>
            There Are No Builds To Show
            <br />
            <a href="/create-build">

            <button   className=" w-48 px-4 py-4 bg-gradient-to-r from-blue-600  to-purple-600 rounded-xl font-bold text-lg shadow-lg">Create Your Build</button>
            </a>
            </center>
            </div>
      }
    </div>
  )
}

export default page