import { PinataSDK } from "pinata";
const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_KEY,
    pinataGateway: "example-gateway.mypinata.cloud",
  });
const fetchImageUrl=async(cid:any)=>{
    try {
  
      const url = await pinata.gateways.createSignedURL({
        gateway:"violet-wrong-herring-709.mypinata.cloud",
         cid: cid,
          expires: 1800000000000,
      })
      console.log(url);
      return url;
  
    } catch (error) {
      console.log(error);
      return "";
    }
  
  }
export default fetchImageUrl;