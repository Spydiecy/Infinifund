"use client"

import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { flowTestnet } from '@/lib/rainbowkit-config'

export default function WalletConnectDemo() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const handleSwitchToFlowEvm = () => {
    switchChain({ chainId: flowTestnet.id })
  }

  // Mock contract status for now - you can replace this with actual contract hooks
  const isCitizen = false
  const isAdmin = false
  const loading = false

  const requestCitizenship = () => {
    console.log('Request citizenship functionality to be implemented')
  }

  const handleGetProjects = () => {
    console.log('Get projects functionality to be implemented')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WalletConnect Demo</h1>
      
      {/* Wallet Connection Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Wallet Status</h2>
        {isConnected ? (
          <div>
            <p className="text-green-600">✅ Connected</p>
            <p className="text-sm text-gray-600">Address: {address}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => disconnect()}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Disconnect
              </button>
              <button
                onClick={handleSwitchToFlowEvm}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Switch to Flow EVM
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-red-600">❌ Not Connected</p>
            <div className="mt-2">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>

      {/* Contract Status */}
      {isConnected && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Contract Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p>Citizen Status: {isCitizen ? '✅ Citizen' : '❌ Not a citizen'}</p>
              <p>Admin Status: {isAdmin ? '✅ Admin' : '❌ Not an admin'}</p>
              
              {!isCitizen && (
                <button
                  onClick={requestCitizenship}
                  className="mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
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
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Contract Interactions</h2>
          <div className="space-x-2">
            <button
              onClick={handleGetProjects}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Get All Projects
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
