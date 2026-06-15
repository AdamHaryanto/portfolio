import React, { useState, useEffect } from 'react';
import { Power } from 'lucide-react';

interface IntroOverlayProps {
  onComplete: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [showStart, setShowStart] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowStart(true);
          return 100;
        }
        // Random increment for realistic loading feel
        return prev + Math.floor(Math.random() * 5) + 1; 
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 800); // Wait for transition
  };

  if (isFading) {
    return (
      <div className="fixed inset-0 z-[100] bg-brand-dark transition-all duration-700 ease-in-out opacity-0 pointer-events-none origin-center scale-150" />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-brand-dark flex flex-col items-center justify-center text-brand-bg p-4 cursor-default select-none">
      <div className="max-w-md w-full flex flex-col items-center gap-8">
        
        {/* Logo / Title Area */}
        <div className="text-center space-y-2 animate-pulse">
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase border-4 border-brand-bg p-4 shadow-[8px_8px_0px_0px_#FFF8E7]">
             System Boot
           </h1>
           <p className="font-mono text-brand-green font-bold text-sm md:text-base tracking-widest">
             v1.0.0 // ADAM_PORTFOLIO_OS
           </p>
        </div>

        {/* Progress Bar */}
        {!showStart ? (
          <div className="w-full space-y-2">
            <div className="h-6 w-full border-2 border-brand-bg p-1">
              <div 
                className="h-full bg-brand-orange transition-all duration-75 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-xs text-brand-bg/70 uppercase">
              <span>Loading Assets...</span>
              <span>{Math.min(progress, 100)}%</span>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleStart}
            className="group relative px-8 py-4 bg-brand-green text-brand-dark font-black text-xl uppercase tracking-wider border-4 border-brand-bg hover:translate-y-1 hover:translate-x-1 active:translate-y-2 active:translate-x-2 transition-transform shadow-[6px_6px_0px_0px_#FFF8E7] hover:shadow-none"
          >
            <div className="flex items-center gap-2">
              <Power className="w-6 h-6 animate-pulse" />
              <span>Press Start</span>
            </div>
          </button>
        )}

        <div className="absolute bottom-8 text-center font-mono text-xs opacity-50">
          <p>INITIALIZING GRAPHICS ENGINE...</p>
          <p>© 2026 ADAM HARYANTO PORTFOLIO</p>
        </div>
      </div>
    </div>
  );
};

export default IntroOverlay;