"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "./infinite-moving-cards";

export function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[30rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <br />
      <center className="font-bold text-white text-5xl p-3">Get Latest <span className="text-blue-600">

      Updates
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
      "NeuraSkill brings transparency and fairness to hackathons. Its open-source nature ensures that anyone can contribute, verify, and improve the system.",
    name: "Satoshi Nakamoto",
    title: "Blockchain Pioneer",
  },
  {
    quote:
      "Decentralization is the future, and NeuraSkill embodies this vision. With smart contracts and AI-driven evaluations, it creates a trustless and efficient ecosystem.",
    name: "Vitalik Buterin",
    title: "Ethereum Co-Founder",
  },
  {
    quote:
      "An open-source hackathon platform like NeuraSkill fosters innovation by allowing developers to build upon and refine its features.",
    name: "Linus Torvalds",
    title: "Creator of Linux",
  },
  {
    quote:
      "With open-source transparency, NeuraSkill eliminates biases in project selection, ensuring fair competition through AI-powered ranking and ETH-based voting.",
    name: "Nick Szabo",
    title: "Smart Contracts Pioneer",
  },
  {
    quote:
      "NeuraSkill is redefining how hackathons operate. By leveraging blockchain and AI, it guarantees fairness, transparency, and automated prize distribution.",
    name: "Andreas M. Antonopoulos",
    title: "Bitcoin Advocate & Author",
  },
];

