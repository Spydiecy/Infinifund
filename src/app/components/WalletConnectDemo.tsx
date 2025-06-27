"use client"

import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { baseSepolia } from '@/lib/rainbowkit-config'
import { useInfinifundContract } from '@/hooks/use-infinifund-contract'
import { useState } from 'react'

export default function WalletConnectDemo() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [projectsData, setProjectsData] = useState<any[]>([])
  const [showProjects, setShowProjects] = useState(false)

  const {
    isCitizen,
    isAdmin,
    loading,
    requestCitizenship,
    getAllProjects,
    fundProject,
    voteForScreening,
    projectCount,
    approveCitizenship,
    revokeCitizenship,
    finalizeScreening,
  } = useInfinifundContract()

  const handleSwitchToBaseSepolia = () => {
    switchChain({ chainId: baseSepolia.id })
  }

  const handleGetProjects = async () => {
    try {
      const projects = await getAllProjects()
      setProjectsData(projects)
      setShowProjects(true)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleFundProject = async (projectId: number) => {
    try {
      await fundProject(projectId, '1000000000000000') // 0.001 ETH
    } catch (error) {
      console.error('Error funding project:', error)
    }
  }

  const handleVote = async (projectId: number, support: boolean) => {
    try {
      await voteForScreening(projectId, support)
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleApproveCitizenship = async (userAddress: string) => {
    try {
      await approveCitizenship(userAddress)
    } catch (error) {
      console.error('Error approving citizenship:', error)
    }
  }

  const handleRevokeCitizenship = async (userAddress: string) => {
    try {
      await revokeCitizenship(userAddress)
    } catch (error) {
      console.error('Error revoking citizenship:', error)
    }
  }

  const handleFinalizeScreening = async (projectId: number) => {
    try {
      await finalizeScreening(projectId)
    } catch (error) {
      console.error('Error finalizing screening:', error)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">Base Sepolia Network Demo</h1>
      
      {/* Wallet Connection Status */}
      <div className="bg-black/50 border border-white/20 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Wallet Status</h2>
        {isConnected ? (
          <div>
            <p className="text-green-400">✅ Connected</p>
            <p className="text-sm text-white/60">Address: {address}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => disconnect()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Disconnect
              </button>
              <button
                onClick={handleSwitchToBaseSepolia}
                className="bg-white/80 hover:bg-white text-black px-4 py-2 rounded"
              >
                Switch to Base Sepolia
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-red-400">❌ Not Connected</p>
            <div className="mt-2">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>

      {/* Contract Status */}
      {isConnected && (
        <div className="bg-black/50 border border-white/20 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Contract Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p>Citizen Status: {isCitizen ? '✅ Citizen' : '❌ Not a citizen'}</p>
              <p>Admin Status: {isAdmin ? '✅ Admin' : '❌ Not an admin'}</p>
              <p>Total Projects: {projectCount}</p>
              
              {!isCitizen && (
                <button
                  onClick={requestCitizenship}
                  className="mt-2 bg-white/80 hover:bg-white text-black px-4 py-2 rounded"
                  disabled={loading}
                >
                  Request Citizenship
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contract Interactions */}
      {isConnected && isCitizen && (
        <div className="bg-black/50 border border-white/20 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Contract Interactions</h2>
          <div className="space-x-2 mb-4">
            <button
              onClick={handleGetProjects}
              className="bg-white/80 hover:bg-white text-black px-4 py-2 rounded"
              disabled={loading}
            >
              Get All Projects
            </button>
            <button
              onClick={() => setShowProjects(!showProjects)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              {showProjects ? 'Hide Projects' : 'Show Projects'}
            </button>
          </div>

          {/* Projects Display */}
          {showProjects && projectsData.length > 0 && (
            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-semibold">Projects</h3>
              {projectsData.map((project, index) => (
                <div key={index} className="bg-black/30 border border-white/10 p-4 rounded">
                  <h4 className="font-bold text-white">{project.name}</h4>
                  <p className="text-sm text-white/70 mb-2">{project.details}</p>
                  <div className="text-xs text-white/60 mb-3">
                    <p>Status: {project.status}</p>
                    <p>Funding Raised: {project.fundingRaised} ETH</p>
                    <p>Creator: {project.creator}</p>
                  </div>
                  
                  <div className="space-x-2">
                    <button
                      onClick={() => handleFundProject(index)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      disabled={loading}
                    >
                      Fund (0.001 ETH)
                    </button>
                    <button
                      onClick={() => handleVote(index, true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      disabled={loading}
                    >
                      Vote Yes
                    </button>
                    <button
                      onClick={() => handleVote(index, false)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      disabled={loading}
                    >
                      Vote No
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Network Information */}
      <div className="bg-black/50 border border-white/20 p-4 rounded-lg mt-6">
        <h2 className="text-lg font-semibold mb-2">Network Information</h2>
        <div className="text-sm text-white/80 space-y-1">
          <p><strong>Network:</strong> Base Sepolia Testnet</p>
          <p><strong>Chain ID:</strong> 84532</p>
          <p><strong>Currency:</strong> ETH</p>
          <p><strong>RPC:</strong> rpc.ankr.com/base_sepolia/...</p>
          <p><strong>Explorer:</strong> base-sepolia.blockscout.com</p>
        </div>
      </div>
    </div>
  )
}
