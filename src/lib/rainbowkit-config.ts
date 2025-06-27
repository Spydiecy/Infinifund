'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'viem'
import { defineChain } from 'viem'

// Define Base Sepolia Testnet
export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/base_sepolia/8cd8e951cc28ebd329a4f5281020c4ffc1124d8db2a1aa415b823972e5edbc24'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Base Sepolia Explorer',
      url: 'https://base-sepolia.blockscout.com',
    },
  },
  testnet: true,
})

export const rainbowConfig = getDefaultConfig({
  appName: 'Infinifund',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://rpc.ankr.com/base_sepolia/8cd8e951cc28ebd329a4f5281020c4ffc1124d8db2a1aa415b823972e5edbc24'),
  },
  ssr: true, // Enable server-side rendering support
})
