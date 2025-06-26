"use client";
import React from "react";
import { WobbleCard } from "./wobble-card";

export function WobbleCardDemo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full mt-9 mb-6">
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
        className=""
      >
        <div className="max-w-xs">
          <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Decentralized Project Funding for Longevity Science
          </h2>
          <p className="mt-4 text-left  text-base/6 text-neutral-200">
          A blockchain-powered platform where researchers submit breakthrough projects in longevity, biotech, and AI for transparent community funding.
          </p>
        </div>
        <div className="absolute -right-4 lg:-right-[40%] -bottom-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl backdrop-blur-sm border border-white/10">
          <div className="w-full h-full rounded-2xl bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-pink-500/30 animate-pulse"></div>
        </div>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 min-h-[300px]">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
        Transparent & Milestone-Based Funding
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
        Citizens vote on projects, and funds are released based on completed research milestones, ensuring accountability and progress tracking.
        </p>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
        <div className="max-w-sm">
          <h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Advancing Human Longevity in Infinita City
          </h2>
          <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          Infinifund powers "The City That Never Dies" - supporting revolutionary research in biotechnology, cybernetics, computational science, and human enhancement technologies.
          </p>
        </div>
        <div className="absolute -right-10 md:-right-[40%] lg:-right-[20%] -bottom-10 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl backdrop-blur-sm border border-white/10">
          <div className="w-full h-full rounded-2xl bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-indigo-500/30 animate-pulse delay-500"></div>
        </div>
      </WobbleCard>
    </div>
  );
}
