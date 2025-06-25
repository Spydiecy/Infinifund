"use client";

import { TypewriterEffectSmooth } from "../ui/typewriter-effect";

export function TypewriterEffectSmoothDemo() {
  const words = [
    {
      text: "Your",
      className: "text-white",
    },
    {
      text: "Latest",
      className: "text-white",
    },
    {
      text: "Builds.....",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center ">
      <TypewriterEffectSmooth words={words} />
    </div>
  );
}
0