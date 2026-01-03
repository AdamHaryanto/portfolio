import React from 'react';

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-brand-bg">
      
      {/* 1. Moving Grid Effect (Subtle Floor) */}
      <div className="absolute inset-0 opacity-[0.1]"
           style={{
             backgroundImage: 'linear-gradient(#2D2D2D 1.5px, transparent 1.5px), linear-gradient(90deg, #2D2D2D 1.5px, transparent 1.5px)',
             backgroundSize: '50px 50px',
             animation: 'gridMove 60s linear infinite',
           }}
      />

      {/* 2. Large Soft Gradient Blobs (Atmosphere) */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-orange/20 rounded-full blur-3xl animate-[blob_20s_infinite] mix-blend-multiply" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-brand-blue/20 rounded-full blur-3xl animate-[blob_25s_infinite_reverse] mix-blend-multiply" />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-brand-yellow/20 rounded-full blur-3xl animate-[pulse_10s_infinite] mix-blend-multiply" />

      {/* 3. Retro Memphis Shapes (The "Cool" Elements) */}
      <div className="absolute inset-0 w-full h-full">
         
         {/* Squiggle - Top Left */}
         <div className="absolute top-[15%] left-[5%] text-brand-orange opacity-60 animate-[float_12s_ease-in-out_infinite]">
             <SquiggleIcon size={140} />
         </div>

         {/* Donut - Center Right */}
         <div className="absolute top-[40%] right-[8%] border-[16px] border-brand-green/40 w-32 h-32 rounded-full animate-[float_15s_ease-in-out_infinite_reverse]" 
              style={{ animationDelay: '1s' }} />

         {/* Solid Circle - Top Right */}
         <div className="absolute top-[10%] right-[20%] w-16 h-16 bg-brand-red/40 rounded-full animate-[bounce_8s_infinite]" />

         {/* Triangle - Bottom Left */}
         <div className="absolute bottom-[20%] left-[10%] text-brand-yellow opacity-60 animate-[spinSlow_30s_linear_infinite]">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
               <polygon points="50,10 90,90 10,90" />
            </svg>
         </div>

         {/* ZigZag - Top Center */}
         <div className="absolute top-[10%] left-[45%] text-brand-red opacity-50 animate-[float_18s_ease-in-out_infinite]" style={{ animationDelay: '3s' }}>
            <ZigZagIcon width={180} height={50} />
         </div>

         {/* Plus Patterns - Scattered */}
         <div className="absolute top-[70%] right-[20%] text-brand-dark opacity-20 animate-[spinSlow_20s_linear_infinite]">
             <PlusIcon size={80} />
         </div>
         <div className="absolute top-[30%] left-[20%] text-brand-dark opacity-10 animate-[spinSlow_25s_linear_infinite_reverse]">
             <PlusIcon size={50} />
         </div>

         {/* 3D Box Wireframe - Bottom Right */}
         <div className="absolute bottom-[10%] right-[5%] w-48 h-48 border-4 border-brand-blue/40 rotate-12 animate-[float_14s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
             <div className="absolute top-[-20px] left-[-20px] w-full h-full border-4 border-brand-blue/40" />
             <div className="absolute bottom-[-20px] right-[-20px] w-full h-full border-4 border-brand-blue/40" />
         </div>

         {/* Dashed Circle - Big Center */}
         <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border-[6px] border-dashed border-brand-dark/10 rounded-full animate-[spinSlow_60s_linear_infinite]" />
      </div>

      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-30px) translateX(10px) rotate(5deg); }
          66% { transform: translateY(15px) translateX(-5px) rotate(-3deg); }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>
    </div>
  );
};

// --- SVG Shapes Components ---

const PlusIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
     <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
  </svg>
);

const SquiggleIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size / 2} viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round">
    <path d="M20 50 Q 50 10, 80 50 T 140 50 T 200 50" />
  </svg>
);

const ZigZagIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 35 L 20 5 L 35 35 L 50 5 L 65 35 L 80 5 L 95 35" />
  </svg>
);

export default BackgroundAnimation;