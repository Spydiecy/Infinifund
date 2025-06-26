'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'viem'
import { defineChain } from 'viem'

// Define Flow EVM Testnet
export const flowTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Flow EVM Testnet Explorer',
      url: 'https://evm-testnet.flowscan.io',
    },
  },
  testnet: true,
})

export const rainbowConfig = getDefaultConfig({
  appName: 'Infinifund',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [flowTestnet],
  transports: {
    [flowTestnet.id]: http('https://testnet.evm.nodes.onflow.org'),
  },
  ssr: true, // Enable server-side rendering support
})
