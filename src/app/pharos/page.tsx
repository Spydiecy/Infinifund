import React from 'react';

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Pharos Network Video</h1>
      <video
        controls
        className="w-full max-w-3xl rounded-lg shadow-lg"
      >
        <source src="https://firebasestorage.googleapis.com/v0/b/osc-official-b3cab.appspot.com/o/pharos.mp4?alt=media&token=f0b5b116-23b8-460e-a291-41bcc08d325f" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Page;
