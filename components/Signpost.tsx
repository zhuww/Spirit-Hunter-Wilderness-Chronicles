import React from 'react';
import { 
  Zap, Heart, Shield, Target
} from 'lucide-react';
import { Beast, Player } from '../types';

interface SignpostProps {
  beasts: Beast[];
  player: Player;
  selectedBeastId: string | null;
  onCaptureAttempt: () => void;
  onSelectBeast: (id: string) => void;
}

const Signpost: React.FC<SignpostProps> = ({ 
  beasts, 
  player, 
  selectedBeastId, 
  onCaptureAttempt,
  onSelectBeast
}) => {
  const selectedBeast = beasts.find(b => b.id === selectedBeastId);
  const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;

  return (
    <div className="fixed top-6 right-6 z-50 w-72 parchment-panel rounded-lg overflow-hidden font-serif">
      
      {/* Ancient Header */}
      <div className="bg-[#292524] p-3 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
        
        <div className="relative z-10 flex items-center gap-2 mx-auto">
           <span className="text-sm font-cinzel font-bold text-[#a8a29e] tracking-[0.2em] uppercase">Chronicle</span>
        </div>
      </div>

      <div className="p-5 relative">
        {/* Arrows / Quiver Count */}
        <div className="absolute top-2 right-3 flex flex-col items-center opacity-60">
             <span className="text-2xl font-cinzel font-bold text-[#44403c] leading-none">{player.arrows}</span>
             <div className="w-8 h-px bg-[#44403c] my-1"></div>
        </div>

        {selectedBeast ? (
          // --- DETAILED SCROLL ENTRY ---
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center mb-6">
              <div className={`
                relative w-28 h-28 flex items-center justify-center mb-4 transition-all duration-700
                ${selectedBeast.isCaptured ? 'grayscale-0' : 'grayscale opacity-80'}
              `}>
                <img 
                    src={getSpriteUrl(selectedBeast.spriteId)} 
                    alt={selectedBeast.name}
                    className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              
              <h3 className="font-cinzel font-bold text-xl text-[#1c1917] tracking-wider mb-1">{selectedBeast.name}</h3>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#78716c]">
                 {selectedBeast.rarity}
              </span>
            </div>

            <p className="text-sm text-[#44403c] italic leading-relaxed text-center mb-6 font-serif">
               "{selectedBeast.description}"
            </p>

            {selectedBeast.isCaptured ? (
              <div className="space-y-3 px-2">
                 <div className="flex justify-center gap-6 text-[#57534e]">
                    <div className="flex flex-col items-center gap-1" title="Power">
                        <Zap size={14} />
                        <span className="font-cinzel text-xs">{selectedBeast.stats.lightning}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1" title="Spirit">
                        <Heart size={14} />
                        <span className="font-cinzel text-xs">{selectedBeast.stats.love}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1" title="Resilience">
                        <Shield size={14} />
                        <span className="font-cinzel text-xs">{selectedBeast.stats.defense}</span>
                    </div>
                 </div>
                 
                 <div className="text-center mt-4">
                    <span className="text-xs font-cinzel text-amber-700 border border-amber-700/30 px-3 py-1 rounded-full">Bonded Spirit</span>
                 </div>

                 <button 
                    onClick={() => onSelectBeast("")} 
                    className="w-full mt-4 text-xs text-[#78716c] hover:text-[#292524] uppercase tracking-widest transition-colors"
                 >
                    Close
                 </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={onCaptureAttempt}
                  disabled={player.arrows <= 0}
                  className="w-full group relative overflow-hidden bg-[#7f1d1d] hover:bg-[#991b1b] text-[#e5e5e5] py-3 rounded-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                >
                   <div className="flex items-center justify-center gap-3 relative z-10 font-cinzel font-bold tracking-widest text-xs uppercase">
                      <Target size={14} />
                      <span>Bind Spirit</span>
                   </div>
                </button>
                <button 
                    onClick={() => onSelectBeast("")} 
                    className="w-full text-center text-xs text-[#78716c] hover:text-[#292524] uppercase tracking-widest"
                 >
                    Return
                 </button>
              </div>
            )}
          </div>
        ) : (
          // --- SPIRIT RUNE LIST ---
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#78716c] mb-4 text-center">
               Known Spirits
            </div>
            <div className="grid grid-cols-4 gap-3">
               {beasts.map(beast => (
                 <button 
                   key={beast.id}
                   onClick={() => onSelectBeast(beast.id)}
                   className={`
                     aspect-square rounded-full flex items-center justify-center transition-all duration-300 relative group
                     ${beast.isCaptured 
                        ? 'bg-[#e7e5e4] shadow-inner' 
                        : 'bg-[#d6d3d1] opacity-60 hover:opacity-100 hover:bg-[#e7e5e4]'}
                   `}
                   title={beast.name}
                 >
                    <img 
                        src={getSpriteUrl(beast.spriteId)} 
                        alt={beast.name}
                        className={`w-8 h-8 object-contain transition-transform group-hover:scale-110 ${!beast.isCaptured ? 'grayscale contrast-125' : ''}`}
                    />
                    {beast.isCaptured && (
                        <div className="absolute -bottom-1 w-1 h-1 bg-amber-600 rounded-full"></div>
                    )}
                 </button>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signpost;