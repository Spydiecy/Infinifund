import React from 'react';
import { Sparkles } from '../sparkles';
import Image from 'next/image';

function TrustedByIndustryLeaders() {
  const industryLogos = [
    { id: 1, name: "Partner 1" },
    { id: 2, name: "Partner 2" },
    { id: 3, name: "Partner 3" },
    { id: 4, name: "Partner 4" },
    { id: 5, name: "Partner 5" },
  ];

  return (
    <>
      <div className='py-20 w-screen overflow-hidden bg-black'>
        <div className='mx-auto max-w-6xl px-6'>
          <div className='text-center text-4xl text-white mb-16'>
            <span className='text-blue-200'>Trusted by Industry Leaders</span>
            <p className='text-lg text-gray-300 mt-4 max-w-3xl mx-auto'>
              Leading biotechnology companies, research institutions, and longevity organizations trust Infinifund to drive breakthrough discoveries in human health and longevity research.
            </p>
          </div>
          
          <div className='grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center'>
            {industryLogos.map((logo) => (
              <div 
                key={logo.id} 
                className='relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center hover:scale-105 transition-transform duration-300'
              >
                <div className='filter brightness-0 invert'>
                  <Image
                    src={`/sponsor-images/${logo.id}.png`}
                    alt={logo.name}
                    width={80}
                    height={80}
                    className='object-contain w-16 h-16 md:w-20 md:h-20'
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className='text-center mt-16'>
            <p className='text-gray-400 text-sm'>
              Join the ecosystem of organizations advancing human longevity and biotech innovation
            </p>
          </div>
        </div>
        <div className='relative -mt-32 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#369eff,transparent_80%)] before:opacity-100 after:absolute after:-left-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[100%] after:border-t after:border-[#7876c566] after:bg-zinc-900'>
          <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff2c_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px] '></div>

          <Sparkles
            density={800}
            speed={1}
            size={1.1}
            color='#FFFFFF'
            className='absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]'
          />
        </div>
      </div>
    </>
  );
}

export default TrustedByIndustryLeaders;