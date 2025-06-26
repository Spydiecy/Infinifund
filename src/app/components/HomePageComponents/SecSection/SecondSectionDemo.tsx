import React from "react";
import { Cover } from "./cover";

export function CoverDemo() {
  return (
    <div>
      <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
        Fund breakthrough projects <br /> in <Cover>Infinita City</Cover>
      </h1>
      <p className="text-gray-400 text-lg max-w-4xl mx-auto text-center mt-4">
        Support revolutionary research in longevity science, biotechnology, AI, and human enhancement through our decentralized funding platform
      </p>
    </div>
  );
}
