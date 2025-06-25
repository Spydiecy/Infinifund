"use client";

import { useEffect, useState } from "react";
import {Carousel} from "../../components/ui/carousels";
import toast from "react-hot-toast";
import Web3 from "web3"
import ABI from "../../ABI.json";
import fetchImageUrl from "@/app/components/fetchImageUrl";
import { button } from "@heroui/react";
const web3 = new Web3(window.ethereum)
const contractAdd = process.env.NEXT_PUBLIC_CONTRACT_ADD;

import { AbiItem } from 'web3-utils';
const formattedABI: AbiItem[] = JSON.parse(JSON.stringify(ABI));
const contract = new web3.eth.Contract(formattedABI, contractAdd)
export function CarouselDemo() {
  const [hackathons_arr, setHackathons_arr] = useState([]);
  const fetch_hackathons=async ()=>{
    try{
      console.log("Fetch hacakthons calling");

      let fetch_hackathon=await contract.methods.allHackathons().call();
      // console.log("my fetch hacakthon is::::",fetch_hackathon[0])  ;
      
      let arr:any=[];
      console.log("My Hackathons Fetched Are::::",fetch_hackathon);
      for (let i = 0; i < fetch_hackathon.length; i++) {
        let element = fetch_hackathon[i];
        let url=await fetchImageUrl(fetch_hackathon[i].img_url);;
        let obj={
          hack_id:element[0],
          button:"View Details",
          title:element[2],
          src:url,
        }
        arr.push(obj);
      }
      setHackathons_arr(arr);
    }
    catch(error){
      console.log(error);
      
      // toast.error("Error Fetching Hackathons");
    }
  
  }
  useEffect(() => {
    console.log("use Effect Running ");
    
    fetch_hackathons();
    console.log("After Function Calling");
    
  }, [])
  return (
    <div className="relative overflow-hidden w-full h-full py-20">
      <Carousel slides={hackathons_arr} />
    </div>
  );
}
