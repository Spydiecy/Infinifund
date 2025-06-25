import React from 'react';

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">SEI Network Video</h1>
      <video
        controls
        className="w-full max-w-3xl rounded-lg shadow-lg"
      >
        <source src="https://firebasestorage.googleapis.com/v0/b/osc-official-b3cab.appspot.com/o/sei_netowrk.mp4?alt=media&token=01fc3346-903d-4576-b406-a375ff78721f" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Page;
