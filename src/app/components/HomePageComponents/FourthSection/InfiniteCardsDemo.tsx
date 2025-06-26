"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "./infinite-moving-cards";

export function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[30rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <br />
      <center className="font-bold text-white text-5xl p-3">Latest <span className="text-blue-600">

      Research
      </span>
      </center>
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "Infinifund represents the future of decentralized science funding. By connecting breakthrough longevity research with transparent blockchain governance, it accelerates humanity's quest to defeat aging.",
    name: "Dr. David Sinclair",
    title: "Longevity Researcher, Harvard Medical School",
  },
  {
    quote:
      "The marriage of decentralized governance and longevity science funding in Infinita City creates unprecedented opportunities for breakthrough research that traditional institutions wouldn't dare fund.",
    name: "Aubrey de Grey",
    title: "Chief Science Officer, LEV Foundation",
  },
  {
    quote:
      "Infinifund's milestone-based funding ensures that every research dollar is accountable. This transparency is crucial for advancing human enhancement and biotechnology in Próspera.",
    name: "Dr. Balaji Srinivasan",
    title: "Network State Theorist",
  },
  {
    quote:
      "By enabling citizens to directly fund longevity research, Infinifund democratizes scientific progress. Infinita City becomes a true laboratory for human advancement.",
    name: "Dr. José Cordeiro",
    title: "Futurist & Longevity Advocate",
  },
  {
    quote:
      "Infinifund bridges the gap between cutting-edge science and decentralized funding. This model will accelerate breakthroughs in AI, biotechnology, and human enhancement.",
    name: "Dr. Ben Goertzel",
    title: "AI Researcher & SingularityNET Founder",
  },
];

