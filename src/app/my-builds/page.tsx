"use client"
import React, { useEffect, useState } from 'react'
import { BentoGridDemo } from './My-builds'
import Web3 from "web3"
import ABI from "../../lib/abi.json";
import { TypewriterEffectSmoothDemo } from './effect'
import { AbiItem } from 'web3-utils';
import fetchContract from '../components/fetchContract';
import { useAccount } from 'wagmi'
let contract = fetchContract();

const Page = () => {
  const { address, isConnected } = useAccount()
  const [build_data, setBuild_data] = useState([])
  
  const fetch_data = async () => {
    if (!isConnected || !address) {
      console.log("Wallet not connected")
      return
    }
    
    try {
      const build_arr = await contract.methods.getallbuilds().call({ from: address });
      console.log("My Build Array is:::::", build_arr);
      setBuild_data(build_arr)
    } catch (error) {
      console.error("Error fetching builds:", error)
    }
  }
  useEffect(() => {
    fetch_data();
  }, [isConnected, address])
  
  return (
    <div className='pt-24'>
      <TypewriterEffectSmoothDemo></TypewriterEffectSmoothDemo>
      {build_data.length != 0 &&
        <BentoGridDemo props={build_data}></BentoGridDemo>
      }
      {
        build_data.length == 0 && 
        <div>
          <center className='text-4xl mt-24'>
            There Are No Builds To Show
            <br />
            <a href="/create-build">
              <button className="w-48 px-4 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg">Create Your Build</button>
            </a>
          </center>
        </div>
      }
    </div>
  )
}

export default Page