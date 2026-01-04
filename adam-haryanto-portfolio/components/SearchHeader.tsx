import React from 'react';
import { Search } from 'lucide-react';

const SearchHeader: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-12 transform hover:scale-[1.02] transition-transform duration-300">
      <div className="relative flex items-center bg-white dark:bg-brand-dark-bg border-4 border-brand-dark dark:border-brand-bg rounded-full h-20 md:h-24 shadow-retro dark:shadow-retro-light overflow-hidden">
        <div className="h-full bg-brand-blue w-20 md:w-28 flex items-center justify-center border-r-4 border-brand-dark dark:border-brand-bg">
          <Search className="w-10 h-10 md:w-12 md:h-12 text-brand-dark dark:text-brand-bg stroke-[3]" />
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <h1 className="text-3xl md:text-5xl font-black text-brand-dark dark:text-brand-bg tracking-tight text-center">
            Adam Haryanto
          </h1>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;