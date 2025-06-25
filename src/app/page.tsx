// import {Button} from "@heroui/react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@heroui/react";
import {Badge, Avatar} from "@heroui/react";
import { CoverDemo } from "./components/HomePageComponents/SecSection/SecondSectionDemo";
import { WobbleCardDemo } from "./components/HomePageComponents/ThirdSection/WobbleCardDemo";
import { InfiniteMovingCards } from "./components/HomePageComponents/FourthSection/infinite-moving-cards";
import { InfiniteMovingCardsDemo } from "./components/HomePageComponents/FourthSection/InfiniteCardsDemo";
import { FocusCardsDemo } from "./components/HomePageComponents/FifthSection/FocusCardsDemo";import Earth from "./components/HomePageComponents/earth";
import GlobeWithSparkles from "./components/HomePageComponents/layout-globe";
import LastBrand from "./components/HomePageComponents/LastSection/trust-brand";
0
export default function Home() {
  return (

   <div className="bg-black  ">
  <GlobeWithSparkles/>
  <div className="h-7"></div>
  <CoverDemo></CoverDemo>
  <div className="h-10"></div>
  <WobbleCardDemo></WobbleCardDemo>

  <div className="h-20"></div>
  <center>

  <h1 className="text-white text-5xl font-extrabold">Upcoming 
    <span className="text-blue-500">
      Hackathons
      </span>
      </h1>
  </center>
  <br /><br />
   <FocusCardsDemo></FocusCardsDemo> 
  <InfiniteMovingCardsDemo></InfiniteMovingCardsDemo>
    <LastBrand></LastBrand>
   </div>
  );
}
