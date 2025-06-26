"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import logo from "./logo.jpg"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useDisconnect } from 'wagmi'

interface NavItem {
  name: string
  href: string
  dropdown?: {
    name: string
    href: string
  }[]
}

const navItems: NavItem[] = [
  {
    name: "Projects",
    href: "/projects",
    dropdown: [
      { name: "Browse Projects", href: "/projects" },
      { name: "Top Projects", href: "/top-projects" },
      { name: "Create Project", href: "/create-project" },
    ],
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    dropdown: [
      { name: "My Dashboard", href: "/dashboard" },
      { name: "My Builds", href: "/my-builds" },
      { name: "My Projects", href: "/my-projects" },
      { name: "Apply Citizenship", href: "/citizenship" },
      { name: "Investors", href: "/investors" },
    ],
  },
  {
    name: "Admin",
    href: "/admin",
  },
]

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const router = useRouter()
  
  // Use RainbowKit hooks
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleDisconnect = async () => {
    try {
      disconnect()
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const mockResults = ["Longevity Research #1", "Biotech Innovation", "Gene Therapy Project"].filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    )
    setSearchResults(query ? mockResults : [])
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-black/30 backdrop-blur-lg border-b border-slate-800/20" 
          : "bg-transparent backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => router.push("/")} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <Image
                src={logo.src || "/placeholder.svg"}
                alt="InfiniFund"
                width={32}
                height={32}
                className="rounded-lg group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-white text-lg font-semibold tracking-tight">InfiniFund</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => router.push(item.href)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50 font-medium text-sm"
                >
                  {item.name}
                  {item.dropdown && <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {activeDropdown === item.name && item.dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-xl border border-slate-700/50 py-2"
                    >
                      {item.dropdown.map((dropdownItem) => (
                        <button
                          key={dropdownItem.name}
                          onClick={() => router.push(dropdownItem.href)}
                          className="w-full text-left px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors text-sm font-medium"
                        >
                          {dropdownItem.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search projects, researchers..."
                className="w-full bg-slate-800/50 text-white placeholder-slate-400 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:bg-slate-800/70 transition-all border border-slate-700/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-xl border border-slate-700/50 py-2"
                >
                  {searchResults.map((result, index) => (
                    <button 
                      key={index} 
                      className="w-full text-left px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors text-sm"
                    >
                      {result}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Wallet Connection */}
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800/70 text-white px-4 py-2 rounded-lg transition-all border border-slate-700/50 group"
                >
                  <div className="w-6 h-6 rounded-full bg-black/60 border border-slate-800 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-sm font-medium">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-xl border border-slate-700/50 py-2"
                    >
                      <button
                        onClick={() => {
                          router.push("/userProfile")
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors text-sm font-medium"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          router.push("/dashboard")
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors text-sm font-medium"
                      >
                        Dashboard
                      </button>
                      <div className="border-t border-slate-700/50 my-1" />
                      <button
                        onClick={handleDisconnect}
                        className="w-full text-left px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-slate-800/50 transition-colors text-sm font-medium"
                      >
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
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
                            <button 
                              onClick={openConnectModal}
                              className="bg-black/80 hover:bg-black border border-slate-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105 shadow-lg"
                            >
                              Connect Wallet
                            </button>
                          )
                        }

                        return (
                          <button 
                            onClick={openAccountModal}
                            className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800/70 text-white px-4 py-2 rounded-lg transition-all border border-slate-700/50"
                          >
                            <div className="w-6 h-6 rounded-full bg-black/60 border border-slate-800 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-slate-300" />
                            </div>
                            <span className="text-sm font-medium">
                              {account.displayName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                            </span>
                          </button>
                        )
                      })()}
                    </div>
                  )
                }}
              </ConnectButton.Custom>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-700/50 py-4"
            >
              {/* Mobile Search */}
              <div className="px-4 pb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search projects, researchers..."
                    className="w-full bg-slate-800/50 text-white placeholder-slate-400 px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/50 border border-slate-700/50"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.name}>
                    <button
                      onClick={() => router.push(item.href)}
                      className="w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors font-medium"
                    >
                      {item.name}
                    </button>
                    {item.dropdown && (
                      <div className="pl-4 space-y-1">
                        {item.dropdown.map((dropdownItem) => (
                          <button
                            key={dropdownItem.name}
                            onClick={() => router.push(dropdownItem.href)}
                            className="w-full text-left px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors text-sm"
                          >
                            {dropdownItem.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

