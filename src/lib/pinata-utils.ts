import { PinataSDK } from "pinata"

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_KEY!,
  pinataGateway: "jade-added-egret-280.mypinata.cloud",
})

export const fetchImageUrl = async (cid: string): Promise<string> => {
  try {
    if (!cid || cid === "") return ""

    // Remove ipfs:// prefix if present
    const cleanCid = cid.replace("ipfs://", "")

    const url = await pinata.gateways.createSignedURL({
      gateway: "violet-wrong-herring-709.mypinata.cloud",
      cid: cleanCid,
      expires: 1800000000000,
    })

    console.log("Pinata URL:", url)
    return url
  } catch (error) {
    console.error("Error fetching image from Pinata:", error)
    return ""
  }
}

export const getImageUrl = (cid: string): string => {
  if (!cid || cid === "") return "/placeholder.svg?height=200&width=200"

  // Remove ipfs:// prefix if present
  const cleanCid = cid.replace("ipfs://", "")

  // Return direct gateway URL for immediate display
  console.log("my cid returned is::::::::",`https://jade-added-egret-280.mypinata.cloud/ipfs/${cleanCid}`);
  
  return `https://jade-added-egret-280.mypinata.cloud/ipfs/${cleanCid}`
}

export default fetchImageUrl
