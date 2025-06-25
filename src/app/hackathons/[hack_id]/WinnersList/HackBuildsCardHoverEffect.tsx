"use client"
import { HoverEffect } from "../../../components/ui/HackBuildsHoverEffect";
import Web3 from "web3"
import ABI from "../../../ABI.json"
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { link } from "fs";
import fetchImageUrl from "@/app/components/fetchImageUrl";
import { AbiItem } from 'web3-utils';
import fetchContract from "@/app/components/fetchContract";
let  contract=fetchContract();
let web3;
if (typeof window !== "undefined") { 
  web3 = new Web3(window.ethereum)
}
export function WinnerBuildsCardHoverEffect() {
  const params=useParams();
  console.log("My Params are :::::::::",params);
  
  const [projects, setProjects] = useState([])
  const fetch_builds=async()=>{
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    const userAddress = accounts[0]
    const tx=await contract.methods.getAllWinners(Number(params["hack_id"])).call({
      from:userAddress
    })
    let arr:any=[];
    for (let i = 0; i < tx.length; i++) {
      const elem = tx[i];
      const tx_project_fetch=await contract.methods.fetch_build(Number(elem.project_id)).call();
      console.log("My Tx Project Fetch is:::::",tx_project_fetch);
      arr.push({
        build_id:tx_project_fetch.project_id,
        title:tx_project_fetch.name,
        link:await fetchImageUrl(tx_project_fetch.video_url),
        desc:tx_project_fetch.desc
      })
    }
    console.log("my Tx in Hack Build Cards Of Winners Are::::::",tx);
    setProjects(arr);
    
  }
  useEffect(() => {
    console.log("My Use Effect is Running");
    
    fetch_builds();
  
  }, [])
  
  return (
    <div className="max-w-5xl mx-auto px-8 mt-10">
      {projects.length!=0 && 
      <div>
        <center> 
        <h1 className="text-4xl font-extrabold mt-7">Top Winning <span className="text-blue-600">
         Builds

        </span>
          🚀</h1>
        </center>
            <HoverEffect items={projects} />
      </div>
            }
      
            {projects.length==0 &&
           <div>
           <center className='text-4xl mt-5 font-bold '>
             No Builds Registered Yet......
             <br />
             
             </center>
             </div>}
    </div>
  );
}