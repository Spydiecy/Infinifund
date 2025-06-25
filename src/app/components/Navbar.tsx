"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown } from "lucide-react"
import { ethers } from "ethers"
import { useRouter } from "next/navigation"
import Image from "next/image"
import logo from "./logo.jpg"

interface NavItem {
  name: string
  href: string
  dropdown?: {
    name: string
    href: string
  }[]
}

interface Chain {
  name: string
  image: string
  contractAddress: string
  chainId: string
  rpcUrl: string
  blockExplorerUrl: string
}

const chains: Chain[] = [
  {
    name: "Root Porcini",
    image: "https://pbs.twimg.com/profile_images/1658639949246386176/6T1Tapl__400x400.jpg",  
    contractAddress: "0x96F439337a2Af4Ff32E867DDf6961cd0B950d6e6",
    chainId: "0x1DF8", // Replace with actual Flow Testnet chain ID
    rpcUrl: "https://porcini.rootnet.app/archive", // Replace with actual RPC URL
    blockExplorerUrl: "https://porcini.rootscan.io", // Replace with actual block explorer URL
  }

  
]

const navItems: NavItem[] = [
  {
    name: "Hacks",
    href: "/hackathons",
    dropdown: [
      { name: "View Hacks", href: "/hackathons" },
      { name: "Create Hacks", href: "/create-hack" },
      { name: "Latest", href: "/hacks/latest" },
    ],
  },
  {
    name: "Builds",
    href: "/create-build",
    dropdown: [
      { name: "My Builds", href: "/my-builds" },
      { name: "Create Build", href: "/create-build" },
      { name: "Submit Build", href: "/builds/0" },
    ],
  },
  {
    name: "About",
    href: "/about",
    dropdown: [
      { name: "About", href: "/about" },
      { name: "Terms & Conditions", href: "/termsAndConditions" },
    ],
  },
]

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [account, setAccount] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedChain, setSelectedChain] = useState<Chain>(chains[0])
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const savedChain = localStorage.getItem("selectedChain")
    if (savedChain) {
      setSelectedChain(JSON.parse(savedChain))
    } else {
      // Automatically store default chain if not present
      localStorage.setItem("selectedChain", JSON.stringify(chains[0]))
      localStorage.setItem("CONTRACT_ADD", chains[0].contractAddress)
    }
  }, [])

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setAccount(address)
        setIsWalletConnected(true)
      } catch (error) {
        console.error("Error connecting wallet:", error)
      }
    } else {
      window.open("https://metamask.io/download/", "_blank")
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const mockResults = ["Popular NFT #1", "Top Collection", "Trending Artist"].filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    )
    setSearchResults(query ? mockResults : [])
  }

  const switchChain = async (chain: Chain) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Try to switch to the chain
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chain.chainId }],
        })
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chain.chainId,
                  chainName: chain.name,
                  nativeCurrency: {
                    name: "Native Token",
                    symbol: "ETH", // Replace with the actual symbol
                    decimals: 18,
                  },
                  rpcUrls: [chain.rpcUrl], // You need to add this to your Chain interface
                  blockExplorerUrls: [chain.blockExplorerUrl], // You need to add this to your Chain interface
                },
              ],
            })
          } catch (addError) {
            console.error("Error adding chain:", addError)
          }
        } else {
          console.error("Error switching chain:", switchError)
        }
      }
    }
  }

  const handleChainSelect = async (chain: Chain) => {
    setSelectedChain(chain)
    localStorage.setItem("selectedChain", JSON.stringify(chain))
    localStorage.setItem("CONTRACT_ADD", chain.contractAddress)
    setIsChainDropdownOpen(false)

    await switchChain(chain)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 rounded-br-2xl rounded-bl-2xl transition-all duration-300 ${
        isScrolled ? "bg-black/50 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-[2560px] mx-auto">
        <div className="flex items-center gap-8 px-4 h-[72px]">
          {/* Logo */}
          <div onClick={() => router.push("/")} className="flex items-center gap-3 cursor-pointer">
            <Image
              src={logo.src || "/placeholder.svg"}
              alt="NeuraSkill Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-white text-xl font-semibold">NeuraSkill</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.href}
                  className="flex items-center gap-1 text-white hover:text-gray-300 transition-colors px-2 py-1"
                >
                  {item.name}
                  <ChevronDown className="w-4 h-4" />
                </a>

                <AnimatePresence>
                  {activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-48 bg-black/30 backdrop-blur-md rounded-lg shadow-lg py-2 border border-white/10"
                    >
                      {item.dropdown?.map((dropdownItem) => (
                        <a
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                        >
                          {dropdownItem.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-[760px] relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search Hacks, builds, and accounts"
                className="w-full bg-white/10 text-white placeholder-gray-400 px-4 py-2 pl-11 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-black/30 backdrop-blur-md rounded-lg shadow-lg py-2 border border-white/10"
                >
                  {searchResults.map((result, index) => (
                    <a key={index} href="#" className="block px-4 py-2 text-white hover:bg-white/10 transition-colors">
                      {result}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isWalletConnected ? (
              <div
                onClick={() => router.push("/userProfile")}
                className="flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg cursor-pointer border border-white/10"
              >
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-green-500 absolute -top-1 -right-1 animate-pulse" />
                  <div className="w-5 h-5 rounded-full bg-white/20" />
                </div>
                <span className="text-sm">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            ) : (
              <div className="relative">
                <div className="flex text-white items-center justify-center">

                <button onClick={connectWallet} className="p-[3px] relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                  <div className="px-3 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:scale-[102%] flex items-center gap-2">
                    <span>Connect Wallet</span>
                   
                  </div>
                </button>
                 <ChevronDown
                      className="w-7 h-7 cursor-pointer  hover:border-2 hover:rounded-lg "
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsChainDropdownOpen(!isChainDropdownOpen)
                      }}
                      />
                      </div>
                <AnimatePresence>
                  {isChainDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-black/30 backdrop-blur-md rounded-lg shadow-lg py-2 border border-white/10"
                    >
                      {chains.map((chain) => (
                        <div
                          key={chain.name}
                          className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => handleChainSelect(chain)}
                        >
                          <Image src={chain.image || "/placeholder.svg"} alt={chain.name} width={24} height={24} />
                          <span>{chain.name}</span>
                          {selectedChain.name === chain.name && (
                            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

