"use client"

import { motion } from "framer-motion"
import { Share2, MoreHorizontal, Calendar, MapPin, Trophy, User } from "lucide-react"
import { useEffect, useState } from "react"
import Web3 from "web3"
import ABI from "../../ABI.json"
import { CarouselDemo } from "./carouse."
import { CardHoverEffectDemo } from "./CardHoverEffectDemo"
import { HackBuildsCardHoverEffect } from "./HackBuildsCardHoverEffect"
import { useParams, useRouter } from "next/navigation"
import fetchImageUrl from "@/app/components/fetchImageUrl"
import toast from "react-hot-toast"
import Image from "next/image"
import { parseAppSegmentConfig } from "next/dist/build/segment-config/app/app-segment-config"
import { WinnerBuildsCardHoverEffect } from "./WinnersList/HackBuildsCardHoverEffect"
import { AbiItem } from 'web3-utils';
import fetchContract from "@/app/components/fetchContract"
const formattedABI: AbiItem[] = JSON.parse(JSON.stringify(ABI));
let  contract=fetchContract();
let web3;
if (typeof window !== "undefined") { 
  web3 = new Web3(window.ethereum)
}
interface hack_details {
  hack_id: string
  hack_owner: string
  title: string
  img_url: string
  desc: string
  prizePool: string
  nAwards: string
  prize_pool_array: string[]
  st_date: string
  end_date: string
  mode: string
}
export default function NFTDetails() {
  const [isFavorited, setIsFavorited] = useState(false)
  const router = useRouter()
  const [isEnded, setIsEnded] = useState<Boolean>(false);
  const [winners_data, setWinners_data] = useState([])
  const [hack_details, setHack_details] = useState<hack_details>({
    hack_id: "",
    hack_owner: "",
    title: "",
    img_url: "",
    desc: "",
    prizePool: "",
    nAwards: "",
    prize_pool_array: [],
    st_date: "",
    end_date: "",
    mode: "",
  })
  const query = useParams()
  console.log("My Hack is:::::",query.hack_id);
 
  const handle_end_hackathon=async ()=>{
    try{

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      const userAddress = accounts[0]
      const tx=await contract.methods.end_hackathon(Number(query.hack_id)).send(
        {
          from:userAddress,
          gasLimit: 3000000,
        }
      )
      console.log("My Tanscation in End Hackathon is::::::",tx);
      
      toast.success("Hackathon Ended Successfully");
      toast.success("Money Successfully Debited");
      router.push('/hackathons');
    }
    catch(error:any){
      toast.error("ERROR",error)
      console.log(error);
      
    }
  }


  const fetch_hack = async () => {
    try {
      console.log("Fetch Build is Running")

      const hack_info = await contract.methods.fetch_hackathon(Number(query.hack_id)).call()
      console.log("my Build Info is::::", hack_info)
      const img_videoUrl = await fetchImageUrl(hack_info.img_url)
      console.log("My Img Video Url is::::", img_videoUrl)

      setHack_details({
        hack_id: hack_info[0],
        hack_owner: hack_info[1],
        title: hack_info[2],
        img_url: img_videoUrl || hack_info[3],
        desc: hack_info[4],
        prizePool: hack_info[5],
        nAwards: hack_info[6],
        prize_pool_array: hack_info[7],
        st_date: hack_info[8],
        end_date: hack_info[9],
        mode: hack_info[10],
      })
      console.log("My Hack Mode is:::::",hack_info[10]);
      console.log("My Comparison in String is::::",(hack_info[10][0]=='E'));
      
      setIsEnded(true?hack_info[10][0]=='E':false);
      
    } catch (error) {
      toast.error("Error Fetching Build")
      console.log("My Error is::::", error)
    }
  }
  useEffect(() => {
    fetch_hack()
  }, [query.hack_id, contract])

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(59, 130, 246, 0)" },
    animate: {
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.3)",
        "0 0 40px rgba(168, 85, 247, 0.4)",
        "0 0 20px rgba(59, 130, 246, 0.3)",
      ],
    },
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
    },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]  text-white p-6 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <motion.div {...fadeIn} className="rounded-2xl overflow-hidden border border-gray-800">
          <Image
            src={hack_details.img_url || "/placeholder.svg"}
            alt={hack_details.title}
            width={1000}
            height={1000}
            className="w-full h-auto object-cover"
            style={{ aspectRatio: "1 / 1" }}
          />
        </motion.div>

        {/* Right Column - Details */}
        <motion.div {...fadeIn} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mt-3">{hack_details.title}</h1>
              <p className="text-gray-400 mt-2">{hack_details.desc}</p>
              <div className="flex items-center gap-4 text-gray-400 mt-4">
                <span className="flex items-center gap-1">
                  <User size={16} />
                  {hack_details.hack_owner.slice(0, 6)}...{hack_details.hack_owner.slice(-4)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(hack_details.st_date).toLocaleDateString()} -{" "}
                  {new Date(hack_details.end_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {hack_details.mode}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                <Share2 size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                <MoreHorizontal size={20} />
              </motion.button>
            </div>
          </div>

          {/* Prize Pool Section */}
          <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800" {...fadeIn}>
            <h2 className="text-xl font-bold mb-4">Prize Pool</h2>
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm">
                  <th className="text-left pb-4">Position</th>
                  <th className="text-left pb-4">Prize</th>
                </tr>
              </thead>
              <tbody>
                {hack_details.prize_pool_array.map((prize, index) => (
                  <tr key={index}>
                    <td className="py-2 flex items-center">
                      <Trophy size={16} className="mr-2" />
                      {index === 0 ? "1st" : index === 1 ? "2nd" : `${index + 1}th`} Prize
                    </td>
                    <td className="py-2">{Web3.utils.fromWei(prize, "ether")} XRP</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right">
              <p className="text-lg font-semibold">
                Total Prize Pool: {Web3.utils.fromWei(hack_details.prizePool, "ether")} ETH
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          {isEnded && <div>
            <motion.button
              
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 bg-gradient-to-r from-red-600 to-purple-800 rounded-xl font-bold text-lg shadow-lg disabled:${isEnded} disabled:cursor-not-allowed`}
            >
              Hackathon Already Ended
            </motion.button>
            </div>}
          {!isEnded && <div className={`space-y-4 disabled:true cursor-none`}>
      
            <motion.button
            
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                console.log("Value Of Is Ended is::::::",isEnded);
                
                router.push("/create-build")
              }}
              className={`w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg `}
            >
              Create Build
            </motion.button>
            <motion.button
             
              onClick={handle_end_hackathon}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 bg-gradient-to-r from-red-600 to-purple-800 rounded-xl font-bold text-lg shadow-lg disabled:${isEnded} disabled:cursor-not-allowed`}
            >
              End Hackathon
            </motion.button>
          </div>}
        </motion.div>
      </div>
      {isEnded && <div>
        <WinnerBuildsCardHoverEffect></WinnerBuildsCardHoverEffect>
        </div>}
      {!isEnded && <div>

      {/* Latest Builds Section */}
      <div className="mt-16">
        <h2 className="text-4xl font-bold text-center mb-8">
          Submit Your <span className="text-blue-600">Build...</span>
        </h2>
        <CardHoverEffectDemo />
      </div>
      <div className="mt-16">
        <h2 className="text-4xl font-bold text-center mb-8">
          Our Latest <span className="text-blue-600">Builds...</span>
        </h2>
        <HackBuildsCardHoverEffect></HackBuildsCardHoverEffect>
   
      </div>

      {/* Carousel Demo */}
      <div className="mt-16">
        <CarouselDemo />
      </div>
      </div>}
    </div>
  )
}

