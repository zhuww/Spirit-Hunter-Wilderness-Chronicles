import React from 'react';

interface PlayerAvatarProps {
  x: number;
  y: number;
  isMoving: boolean;
  direction: 'left' | 'right';
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ x, y, isMoving, direction }) => {
  return (
    <div 
      className="absolute flex flex-col items-center justify-end z-40 transition-all duration-[600ms] ease-linear"
      style={{ 
        top: y, 
        left: x, 
        transform: `translate(-50%, -90%)`, // Adjusted anchor to feet
        willChange: 'top, left',
        zIndex: Math.floor(y) // Depth sorting based on Y position
      }}
    >
      {/* Name Tag */}
      <div className="absolute -top-24 mb-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-yellow-500/30 whitespace-nowrap">
        <span className="text-[10px] text-yellow-200 font-bold tracking-widest uppercase shadow-sm block">
          Spirit Hunter
        </span>
      </div>

      {/* 
         Custom SVG Character: Girl in Hanfu
         Features: Long Yellow Hair, Traditional Robes, Moving Feet
      */}
      <div 
        className={`relative w-32 h-32 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)] transition-transform duration-300`}
        style={{
          transform: `${direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'}` 
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          
          {/* --- MOVING FEET (Under the dress) --- */}
          <g transform="translate(45, 85)">
             <g className={isMoving ? 'animate-leg-left' : ''}>
               <path d="M -5 0 L -5 8 Q -5 12 -8 12 L 2 12 Q 0 12 0 8 L 0 0" fill="#1a202c" /> {/* Shoe Left */}
             </g>
          </g>
          <g transform="translate(55, 85)">
             <g className={isMoving ? 'animate-leg-right' : ''}>
               <path d="M -5 0 L -5 8 Q -5 12 -8 12 L 2 12 Q 0 12 0 8 L 0 0" fill="#1a202c" /> {/* Shoe Right */}
             </g>
          </g>

          {/* --- BODY & DRESS (HANFU) --- */}
          <g className={isMoving ? 'animate-walk' : 'animate-float'}>
             
             {/* Main Robe (Pink/Red/White) */}
             <defs>
               <linearGradient id="robeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#fca5a5" /> {/* Light Red */}
                 <stop offset="100%" stopColor="#ef4444" /> {/* Red */}
               </linearGradient>
             </defs>
             
             {/* Skirt/Lower Robe */}
             <path d="M 35 50 Q 20 90 25 95 L 75 95 Q 80 90 65 50 Z" fill="url(#robeGradient)" />
             
             {/* Sash / Belt */}
             <path d="M 32 50 L 68 50 L 68 58 L 32 58 Z" fill="#fcd34d" />
             <path d="M 40 58 L 40 80 Q 45 85 50 80 L 50 58" fill="#fcd34d" opacity="0.8" /> {/* Hanging Sash */}

             {/* Upper Robe (Cross Collar) */}
             <path d="M 32 50 L 30 35 L 50 25 L 70 35 L 68 50" fill="#fecaca" />
             <path d="M 50 25 L 50 50" stroke="#ef4444" strokeWidth="0.5" /> {/* Center line detail */}
             
             {/* Sleeves (Wide) */}
             {/* Back Arm/Sleeve */}
             <path d="M 30 38 Q 10 45 15 65 L 35 55" fill="#fca5a5" />
             {/* Front Arm/Sleeve */}
             <path d="M 70 38 Q 90 45 85 65 L 65 55" fill="#fca5a5" />
             
             {/* Hands */}
             <circle cx="15" cy="65" r="3" fill="#f6ad55" />
             <circle cx="85" cy="65" r="3" fill="#f6ad55" />

             {/* --- HEAD --- */}
             <circle cx="50" cy="25" r="14" fill="#f6ad55" /> {/* Face */}
             
             {/* Face Features (Side profile-ish) */}
             <circle cx="56" cy="24" r="1.5" fill="#2d3748" /> {/* Eye */}
             <path d="M 56 28 Q 58 30 54 30" stroke="#b45309" strokeWidth="1" fill="none" /> {/* Smile */}

             {/* --- HAIR (Long Yellow) --- */}
             <path d="M 36 25 Q 30 10 50 5 Q 70 10 64 25" fill="#facc15" /> {/* Top Hair */}
             <path d="M 36 20 Q 20 40 25 70 L 40 60 Q 35 40 40 25" fill="#facc15" /> {/* Long Back Hair */}
             <path d="M 64 20 Q 80 40 75 70 L 60 60 Q 65 40 60 25" fill="#facc15" /> {/* Long Front Hair */}
             
             {/* Hair Accessories */}
             <circle cx="36" cy="18" r="3" fill="#ef4444" />
             <circle cx="64" cy="18" r="3" fill="#ef4444" />

          </g>
        </svg>
      </div>

      {/* Shadow Grounding */}
      <div className="w-16 h-4 bg-black/30 blur-sm rounded-[100%] translate-y-[-10px]" />
    </div>
  );
};

export default PlayerAvatar;