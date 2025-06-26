import { CoverDemo } from "./components/HomePageComponents/SecSection/SecondSectionDemo";
import { WobbleCardDemo } from "./components/HomePageComponents/ThirdSection/WobbleCardDemo";
import { FeaturedProjects } from "./components/HomePageComponents/FeaturedSection/FeaturedProjects";
import TrustedByIndustryLeaders from "./components/HomePageComponents/LastSection/trust-brand";
import GlobeWithSparkles from "./components/HomePageComponents/layout-globe";

export default function Home() {
  return (
   <div className="bg-black">
  <GlobeWithSparkles/>
  <div className="h-7"></div>
  <CoverDemo></CoverDemo>
  <div className="h-10"></div>
  <WobbleCardDemo></WobbleCardDemo>
  <div className="h-10"></div>
  <FeaturedProjects></FeaturedProjects>
  <div className="h-10"></div>
  <TrustedByIndustryLeaders></TrustedByIndustryLeaders>
   </div>
  );
}
