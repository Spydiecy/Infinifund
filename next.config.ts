  import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['jade-added-egret-280.mypinata.cloud','res.cloudinary.com','cdn.dorahacks.io','aceternity.com','violet-wrong-herring-709.mypinata.cloud','i.seadn.io','static-files.risein.com','images.unsplash.com','assets.aceternity.com','encrypted-tbn0.gstatic.com','www.cryptoninjas.net','styles.redditmedia.com','public.rootdata.com','pbs.twimg.com','www.base.org','gateway.pinata.cloud','jade-added-egret-280.mypinata.cloud'],
    
  },
  eslint: {
    ignoreDuringBuilds: true,
},
typescript: {
  // !! WARN !!
  // Dangerously allow production builds to successfully complete even if
  // your project has type errors.
  // !! WARN !!
  ignoreBuildErrors: true,
},

};

export default nextConfig;
