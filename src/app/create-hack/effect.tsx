"use client";
import { TypewriterEffectSmooth } from "../components/ui/typewriter-effect";
export function TypewriterEffectSmoothDemo() {
  const words = [
    {
      text: "Create",
      className: "text-white",
    },
    {
      text: "Your",
      className: "text-white",
    },
    {
      text: "Hackathon...",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center ">
      <TypewriterEffectSmooth words={words} />
    </div>
  );
}
