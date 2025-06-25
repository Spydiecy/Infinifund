import { useEffect, useState } from "react";
import { cn } from "../../lib/util";
import fetchImageUrl from "../fetchImageUrl";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?:string;
}) => {
  console.log("My Icon is:::::",icon);
    const [imgUrl, setimgUrl] = useState("https://t3.ftcdn.net/jpg/01/93/54/54/360_F_193545415_6pzIxsRxtPenzgxfVqtuXCG2BE8vitif.jpg")
      const fetch_img=async ()=>{
        let myimgUrl=await fetchImageUrl(icon);
        setimgUrl(myimgUrl);
        // console.log("img url fetched is:::::",imgUrl);
        
      }
      useEffect(() => {
        console.log("use Effect Running");
        
        fetch_img();
      }, [])
      
      console.log("Img Url::::",imgUrl);
  
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-gray-900  border-transparent justify-between flex flex-col space-y-4 mt-4 cursor-pointer",
        className
      )}
    >
      
      <div className="group-hover/bento:translate-x-2 transition duration-200 ">
        <img src={imgUrl} alt="" />
        <div className="font-sans font-bold text-white   dark:text-neutral-200 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-white text-xs dark:text-neutral-300">
          {description}
        </div>
        
      </div>
    </div>
  );
};
