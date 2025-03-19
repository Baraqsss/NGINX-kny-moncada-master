import React from 'react';

const Spinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700"></div>
      <span className="ml-3 text-violet-700">Loading...</span>
    </div>
  );
};

export default Spinner; 