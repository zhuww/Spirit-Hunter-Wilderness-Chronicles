import React from 'react';
import { Beast } from '../types';
import { Flame, Sparkles, Snowflake } from 'lucide-react';

interface BeastCardProps {
  beast: Beast;
  onClick?: () => void;
  isSelected?: boolean;
  viewMode: 'wild' | 'collection' | 'companion';
}

const BeastCard: React.FC<BeastCardProps> = ({ beast, onClick, isSelected, viewMode }) => {
  const isCaptured = beast.isCaptured;

  // URL for animated GIF sprite
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${beast.spriteId}.gif`;
  
  // Fallback static image if GIF fails
  const staticUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${beast.spriteId}.png`;

  // --- COMPANION MODE (Following Player) ---
  if (viewMode === 'companion') {
    return (
      <div 
        onClick={onClick}
        className="relative flex flex-col items-center cursor-pointer pointer-events-auto"
      >
        <div className="relative animate-float-heavy">
           <img 
              src={spriteUrl} 
              alt={beast.name}
              className="w-16 h-16 object-contain drop-shadow-lg filter brightness-110"
              onError={(e) => { e.currentTarget.src = staticUrl; }}
           />
           <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-black/30 blur-sm rounded-full" />
        </div>
        {/* Love/Magic Particle Effect */}
        <div className="absolute -top-4 -right-2">
            <Sparkles size={12} className="text-yellow-300 animate-spin-slow" />
        </div>
      </div>
    );
  }

  // --- WILD SPIRIT MODE (ANIMATED ON FIELD) ---
  if (viewMode === 'wild') {
    return (
      <div 
        onClick={onClick}
        className={`
          relative flex flex-col items-center cursor-pointer transition-all duration-300 group pointer-events-auto
          ${isSelected ? 'z-30' : 'z-10'}
        `}
      >
        {/* Selection Magical Circle (Replacing the Sports-like "Target Locked") */}
        {isSelected && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-8">
             <div className="w-full h-full border-2 border-red-500 rounded-[100%] animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
             <div className="absolute inset-0 border border-red-300/50 rounded-[100%] animate-ping opacity-50"></div>
          </div>
        )}

        {/* The Animated Sprite */}
        <div className={`${isSelected ? 'animate-bounce' : 'animate-breathe'}`}>
           <img 
              src={spriteUrl} 
              alt={beast.name}
              className={`
                w-24 h-24 object-contain drop-shadow-2xl transition-all duration-300
                ${isSelected ? 'filter drop-shadow-[0_0_10px_rgba(255,100,100,0.6)] brightness-110 scale-110' : 'opacity-90 hover:opacity-100 hover:scale-105'}
              `}
              onError={(e) => { e.currentTarget.src = staticUrl; }}
           />
           
           {/* Shadow */}
           {!isSelected && (
             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/40 blur-md rounded-[100%]" />
           )}
           
           {/* Elemental Effects */}
           {beast.stats.lightning > 3 && <Flame size={16} className="absolute bottom-4 right-0 animate-bounce text-orange-500 opacity-80" />}
           {beast.stats.defense > 3 && <Snowflake size={16} className="absolute top-4 -left-2 animate-pulse text-cyan-200 opacity-80" />}
        </div>
      </div>
    );
  }

  // --- CARD MODE (INVENTORY / FALLBACK) ---
  return (
    <div className={`
        relative flex flex-col items-center p-2 rounded-xl border bg-black/40 backdrop-blur-sm transition-all
        ${isCaptured ? 'border-yellow-400 bg-yellow-900/10' : 'border-white/10 grayscale opacity-70'}
      `}>
       <img 
          src={spriteUrl} 
          alt={beast.name}
          className="w-16 h-16 object-contain mb-1" 
          onError={(e) => { e.currentTarget.src = staticUrl; }}
       />
    </div>
  );
};

export default BeastCard;