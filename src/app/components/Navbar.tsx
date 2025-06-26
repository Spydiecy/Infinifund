"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import logo from "./logo.jpg"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { flowTestnet } from '@/lib/rainbowkit-config'

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
    name: "Flow EVM Testnet",
    image: "https://avatars.githubusercontent.com/u/62387156?s=280&v=4",  
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xbc29335737795E7E6839882D1aF663e21Db0E736",
    chainId: "0x221", // 545 in decimal (Flow EVM Testnet)
    rpcUrl: "https://testnet.evm.nodes.onflow.org",
    blockExplorerUrl: "https://evm-testnet.flowscan.io",
  },
  {
    name: "Root Porcini",
    image: "https://pbs.twimg.com/profile_images/1658639949246386176/6T1Tapl__400x400.jpg",  
    contractAddress: "0x96F439337a2Af4Ff32E867DDf6961cd0B950d6e6",
    chainId: "0x1DF8",
    rpcUrl: "https://porcini.rootnet.app/archive",
    blockExplorerUrl: "https://porcini.rootscan.io",
  }
]

const navItems: NavItem[] = [
  {
    name: "Projects",
    href: "/projects",
    dropdown: [
      { name: "Top Projects", href: "/top-projects" },
      { name: "Create Project", href: "/create-project" },
    ],
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    dropdown: [
      { name: "Apply Citizenship", href: "/citizenship" },
      { name: "investors", href: "/investors" },
    ],
  },
  {
    name: "Admin",
    href: "/admin",
    dropdown: [
      { name: "About", href: "/about" },
      { name: "Terms & Conditions", href: "/termsAndConditions" },
    ],
  },
]

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedChain, setSelectedChain] = useState<Chain>(chains[0])
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)
  const router = useRouter()
  
  // Use RainbowKit hooks
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

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

  const handleDisconnect = async () => {
    try {
      disconnect()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const handleSwitchToFlowEvm = async () => {
    try {
      switchChain({ chainId: flowTestnet.id })
      setIsChainDropdownOpen(false)
    } catch (error) {
      console.error("Failed to switch to Flow EVM:", error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const mockResults = ["Popular NFT #1", "Top Collection", "Trending Artist"].filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    )
    setSearchResults(query ? mockResults : [])
  }

  const handleChainSelect = async (chain: Chain) => {
    setSelectedChain(chain)
    localStorage.setItem("selectedChain", JSON.stringify(chain))
    localStorage.setItem("CONTRACT_ADD", chain.contractAddress)
    setIsChainDropdownOpen(false)

    try {
      switchChain({ chainId: flowTestnet.id })
    } catch (error) {
      console.error("Error switching chain:", error)
    }
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
              alt="InfiniFund Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-white text-xl font-semibold">InfiniFund</span>
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
            {isConnected ? (
              <div className="relative">
                <div
                  onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
                  className="flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg cursor-pointer border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-green-500 absolute -top-1 -right-1 animate-pulse" />
                    <div className="w-5 h-5 rounded-full bg-white/20" />
                  </div>
                  <span className="text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </div>
                
                {/* Wallet Dropdown Menu */}
                <AnimatePresence>
                  {isChainDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-black/30 backdrop-blur-md rounded-lg shadow-lg py-2 border border-white/10 z-50"
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => {
                          router.push("/userProfile")
                          setIsChainDropdownOpen(false)
                        }}
                      >
                        <span>👤 Profile</span>
                      </div>
                      <div
                        className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={handleSwitchToFlowEvm}
                      >
                        <span>🔄 Switch to Flow EVM</span>
                      </div>
                      <div className="border-t border-white/10 my-1" />
                      <div
                        className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => {
                          handleDisconnect()
                          setIsChainDropdownOpen(false)
                        }}
                      >
                        <span>🔌 Disconnect</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading'
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated')

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <div className="flex text-white items-center justify-center">
                                <button onClick={openConnectModal} className="p-[3px] relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                                  <div className="px-3 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:scale-[102%] flex items-center gap-2">
                                    <span>Connect Wallet</span>
                                  </div>
                                </button>
                                <ChevronDown
                                  className="w-7 h-7 cursor-pointer hover:border-2 hover:rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setIsChainDropdownOpen(!isChainDropdownOpen)
                                  }}
                                />
                              </div>
                            )
                          }

                          return (
                            <div className="flex text-white items-center justify-center">
                              <button 
                                onClick={openAccountModal}
                                className="flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg cursor-pointer border border-white/10 hover:bg-white/10 transition-colors"
                              >
                                <div className="relative">
                                  <div className="w-2 h-2 rounded-full bg-green-500 absolute -top-1 -right-1 animate-pulse" />
                                  <div className="w-5 h-5 rounded-full bg-white/20" />
                                </div>
                                <span className="text-sm">
                                  {account.displayName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                                </span>
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })()}
                      </div>
                    )
                  }}
                </ConnectButton.Custom>
                
                {/* Chain Dropdown Menu for non-connected state */}
                <AnimatePresence>
                  {isChainDropdownOpen && !isConnected && (
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

