import React from 'react';
import { Search } from 'lucide-react';

const SearchHeader: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6 md:mb-8 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="relative flex items-center bg-white dark:bg-brand-dark-bg border-4 border-brand-dark dark:border-brand-bg rounded-full h-14 sm:h-16 md:h-20 shadow-retro dark:shadow-retro-light overflow-hidden">
        <div className="h-full bg-brand-blue w-14 sm:w-16 md:w-24 flex items-center justify-center border-r-4 border-brand-dark dark:border-brand-bg">
          <Search className="w-7 h-7 md:w-10 md:h-10 text-brand-dark dark:text-brand-bg stroke-[3]" />
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-brand-dark dark:text-brand-bg tracking-tight text-center">
            Adam Haryanto
          </h1>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;
