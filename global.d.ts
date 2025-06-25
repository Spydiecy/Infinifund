// global.d.ts
export {};

declare global {
  interface Window {
    ethereum?: any; // You can use "Ethereum" type from "@metamask/providers"
  }
}
