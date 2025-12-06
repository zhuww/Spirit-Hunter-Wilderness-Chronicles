import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ViewState, Player, Beast, LogEntry } from './types';
import { INITIAL_BEASTS, INITIAL_ARROWS, WORLD_WIDTH, WORLD_HEIGHT } from './constants';
import { generateGhostMessage } from './services/geminiService';
import { ArrowLeft, Swords, BookOpen, Trees, Ghost, Sparkles, Home, Dumbbell, Zap, Shield, Heart } from 'lucide-react';
import BeastCard from './components/BeastCard';
import Signpost from './components/Signpost';
import PlayerAvatar from './components/PlayerAvatar';

const App: React.FC = () => {
  // --- Game State ---
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [player, setPlayer] = useState<Player>({
    arrows: INITIAL_ARROWS,
    capturedBeastIds: []
  });
  
  // World Coordinates (Pixels)
  const [playerPos, setPlayerPos] = useState({ x: 1500, y: 1500 });
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Camera viewport offset
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });
  
  const [beasts, setBeasts] = useState<Beast[]>(INITIAL_BEASTS);
  const [selectedBeastId, setSelectedBeastId] = useState<string | null>(null);
  
  // Training State
  const [trainingBeastId, setTrainingBeastId] = useState<string | null>(null);
  const [showTrainingMenu, setShowTrainingMenu] = useState(false);
  const [trainingAnimation, setTrainingAnimation] = useState<'idle' | 'attack' | 'run' | 'magic'>('idle');

  // UI State
  const [ghostLog, setGhostLog] = useState<LogEntry[]>([]);
  const [isGhostVisible, setIsGhostVisible] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Refs for animation
  const viewportRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const addLog = useCallback((text: string, sender: 'System' | 'Ghost') => {
    setGhostLog(prev => [...prev, { id: Date.now().toString(), text, sender, timestamp: Date.now() }]);
    setNotification(text);
    setTimeout(() => setNotification(null), 5000); // Longer duration for reading
  }, []);

  const handleGhostWhisper = async (trigger: string) => {
    setIsGhostVisible(true);
    const message = await generateGhostMessage(trigger);
    addLog(message, 'Ghost');
    setTimeout(() => setIsGhostVisible(false), 6000);
  };

  const enterWilderness = () => {
    setView(ViewState.WILDERNESS);
    updateCamera(1500, 1500);
    
    if (ghostLog.length === 0) {
       handleGhostWhisper("entered the timeless expanse");
    }
  };

  // Update camera to keep player centered
  const updateCamera = (px: number, py: number) => {
    if (!viewportRef.current) return;
    
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let newCamX = px - viewportW / 2;
    let newCamY = py - viewportH / 2;

    // Clamp camera
    newCamX = Math.max(0, Math.min(newCamX, WORLD_WIDTH - viewportW));
    newCamY = Math.max(0, Math.min(newCamY, WORLD_HEIGHT - viewportH));

    setCameraPos({ x: newCamX, y: newCamY });
  };

  useEffect(() => {
    updateCamera(playerPos.x, playerPos.y);
  }, [playerPos]);

  useEffect(() => {
    const handleResize = () => updateCamera(playerPos.x, playerPos.y);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [playerPos]);


  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only move if not clicking a beast card or UI
    if ((e.target as HTMLElement).closest('.beast-card, .ui-panel')) return;
    if (!viewportRef.current) return;

    // Get click position relative to the viewport
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Convert to World Coordinates
    const targetX = cameraPos.x + clickX;
    const targetY = cameraPos.y + clickY;
    
    // Determine direction
    setDirection(targetX > playerPos.x ? 'right' : 'left');

    setIsMoving(true);
    setPlayerPos({ x: targetX, y: targetY });
    
    setTimeout(() => setIsMoving(false), 600); 
  };

  const selectBeast = (id: string) => {
    if (selectedBeastId === id) {
        setSelectedBeastId(null); 
    } else {
        setSelectedBeastId(id);
    }
  };

  const attemptCapture = async () => {
    if (!selectedBeastId) return;
    if (player.arrows <= 0) {
      addLog("The quiver is empty...", "System");
      return;
    }

    const beast = beasts.find(b => b.id === selectedBeastId);
    if (!beast) return;

    const dist = Math.sqrt(Math.pow(beast.position.x - playerPos.x, 2) + Math.pow(beast.position.y - playerPos.y, 2));
    if (dist > 400) {
        setNotification("The spirit is too distant.");
        return;
    }

    setPlayer(prev => ({ ...prev, arrows: prev.arrows - 1 }));

    const roll = Math.random();
    let successChance = 0.7;
    if (beast.rarity === 'Rare') successChance = 0.4;
    if (beast.rarity === 'Legendary') successChance = 0.2;

    if (roll < successChance) {
      setBeasts(prev => prev.map(b => b.id === beast.id ? { ...b, isCaptured: true } : b));
      setPlayer(prev => ({ ...prev, capturedBeastIds: [...prev.capturedBeastIds, beast.id] }));
      addLog(`Bond forged with ${beast.name}`, "System");
      handleGhostWhisper(`captured the ${beast.name}`);
    } else {
      addLog(`The ${beast.name} vanished into mist...`, "System");
    }
  };

  // --- Training Logic ---
  const handleCageSelect = (id: string) => {
    setTrainingBeastId(id);
    setShowTrainingMenu(false);
    setTrainingAnimation('idle');
  };

  const handleBeastClickInTraining = () => {
    if (trainingBeastId) {
      setShowTrainingMenu(true);
    }
  };

  const executeTraining = (type: 'attack' | 'run' | 'magic') => {
    setTrainingAnimation(type);
    setShowTrainingMenu(false);
    
    // Determine stats improvement based on type
    setBeasts(prev => prev.map(b => {
      if (b.id === trainingBeastId) {
        const newStats = { ...b.stats };
        if (type === 'attack') newStats.lightning = Math.min(5, newStats.lightning + 1);
        if (type === 'magic') newStats.love = Math.min(5, newStats.love + 1);
        if (type === 'run') newStats.defense = Math.min(5, newStats.defense + 1);
        return { ...b, stats: newStats };
      }
      return b;
    }));

    addLog(`Training session complete!`, "System");
    
    // Reset animation after delay
    setTimeout(() => setTrainingAnimation('idle'), 2000);
  };

  // --- Render Helpers ---

  const renderMainMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c0a09] relative overflow-hidden">
      {/* TIMELESS VOID BACKGROUND */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-gray-900 to-stone-950"></div>
          {/* Animated Particles/Stars */}
          {Array.from({ length: 20 }).map((_, i) => (
             <div key={i} className="absolute rounded-full bg-amber-500/20 blur-[1px] animate-pulse-soft"
                style={{
                    width: Math.random() * 4 + 1 + 'px',
                    height: Math.random() * 4 + 1 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 5 + 's'
                }}
             ></div>
          ))}
          {/* Mist */}
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>

      <div className="relative z-10 text-center space-y-12 max-w-2xl w-full mx-4 animate-float">
        <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-cinzel text-transparent bg-clip-text bg-gradient-to-br from-amber-200 to-yellow-700 font-bold drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)] tracking-wider">
            SPIRIT HUNTER
            </h1>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-700 to-transparent"></div>
            <p className="text-stone-400 text-xl font-serif tracking-widest uppercase text-xs">
            Wilderness Chronicles
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">
          
          <button 
            className="group relative w-32 h-32 flex flex-col items-center justify-center rounded-full border border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 hover:border-amber-900 transition-all duration-500 hover:scale-105"
            onClick={() => setView(ViewState.TRAINING)}
          >
            <Dumbbell size={24} className="text-stone-500 group-hover:text-amber-500 transition-colors mb-2" />
            <span className="font-cinzel text-xs text-stone-400 group-hover:text-amber-100 uppercase tracking-widest">Train</span>
          </button>

          <button 
            className="group relative w-40 h-40 flex flex-col items-center justify-center rounded-full border-2 border-amber-900/40 bg-gradient-to-b from-stone-800 to-stone-950 shadow-[0_0_30px_rgba(120,53,15,0.1)] hover:shadow-[0_0_50px_rgba(245,158,11,0.2)] hover:border-amber-600 transition-all duration-500 scale-110"
            onClick={enterWilderness}
          >
            <div className="absolute inset-0 rounded-full border border-stone-600 opacity-20 group-hover:scale-110 transition-transform duration-700"></div>
            <Trees size={32} className="text-amber-700 group-hover:text-amber-400 transition-colors mb-2 animate-pulse-soft" />
            <span className="font-cinzel text-sm font-bold text-amber-500/80 group-hover:text-amber-200 uppercase tracking-widest">Enter<br/>World</span>
          </button>

          <button 
            className="group relative w-32 h-32 flex flex-col items-center justify-center rounded-full border border-stone-700 bg-stone-900/50 hover:bg-stone-800/80 hover:border-red-900 transition-all duration-500 hover:scale-105"
            onClick={() => setView(ViewState.COMBAT)}
          >
            <Swords size={24} className="text-stone-500 group-hover:text-red-500 transition-colors mb-2" />
            <span className="font-cinzel text-xs text-stone-400 group-hover:text-red-100 uppercase tracking-widest">Duel</span>
          </button>

        </div>
        
        <p className="text-stone-600 text-sm italic font-serif">
          "Time flows like a river, but the spirits are eternal."
        </p>
      </div>
    </div>
  );

  const renderWilderness = () => {
    const capturedBeasts = beasts.filter(b => b.isCaptured);
    const wildBeasts = beasts.filter(b => !b.isCaptured);

    // World Transformation
    const transformStyle = {
        transform: `translate3d(${-cameraPos.x}px, ${-cameraPos.y}px, 0)`,
    };

    return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-green-950"
      ref={viewportRef}
    >
      {/* 
         DENSE FOREST BACKGROUND
         Updated to be a rich green forest instead of black void
      */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-green-950 via-green-900 to-emerald-950">
          {/* Canopy Filter */}
          <div className="absolute inset-0 opacity-40" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/forest.png")', backgroundSize: '300px'}}></div>
          {/* Light Shafts */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-800/20 to-yellow-100/10"></div>
          {/* Fog */}
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-emerald-950/80 to-transparent"></div>
      </div>

      {/* UI LAYERS */}
      <button 
        onClick={(e) => { e.stopPropagation(); setView(ViewState.HOME); }}
        className="ui-panel absolute top-6 left-6 z-50 flex items-center gap-3 text-green-100/80 hover:text-white transition-colors group"
      >
        <div className="p-2 rounded-full border border-green-700 group-hover:border-green-400 bg-green-900/80 backdrop-blur-md">
            <ArrowLeft size={18} />
        </div>
        <span className="font-cinzel text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">Return</span>
      </button>

      <div className="ui-panel" onClick={(e) => e.stopPropagation()}>
        <Signpost 
          beasts={beasts}
          player={player}
          selectedBeastId={selectedBeastId}
          onCaptureAttempt={attemptCapture}
          onSelectBeast={selectBeast}
        />
      </div>

      {/* GHOST / NOTIFICATION LAYER */}
      <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center">
        {isGhostVisible && (
            <div className="animate-in fade-in duration-1000 flex flex-col items-center max-w-xl text-center px-4">
                <Sparkles className="text-emerald-200/50 mb-4 animate-spin-slow" size={32} />
                <h2 className="text-3xl md:text-4xl font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-white to-green-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {notification}
                </h2>
                <div className="mt-4 w-24 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </div>
        )}

        {notification && !isGhostVisible && (
            <div className="absolute bottom-1/4 animate-smoke px-6 py-2 text-green-100 font-cinzel text-xl tracking-wide drop-shadow-md">
                {notification}
            </div>
        )}
      </div>

      {/* SCROLLABLE GAME WORLD CONTAINER */}
      <div 
        className="absolute top-0 left-0 w-[3000px] h-[3000px] transition-transform duration-[600ms] ease-linear cursor-crosshair will-change-transform"
        style={transformStyle}
        onClick={handleMapClick}
      >
          {/* GROUND PLANE - FOREST FLOOR */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#1a2e05]">
             {/* Grass Texture Overlay */}
             <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/grass.png')" }}></div>
             
             {/* Dynamic Light patches */}
             {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="absolute rounded-full bg-yellow-200/5 blur-3xl"
                     style={{
                       width: Math.random() * 600 + 'px',
                       height: Math.random() * 600 + 'px',
                       left: Math.random() * 3000 + 'px',
                       top: Math.random() * 3000 + 'px'
                     }}
                ></div>
             ))}
          </div>

          {/* HOME (Ancient Hut) */}
          <div className="absolute top-[1400px] left-[1400px] z-10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2">
             <div className="flex flex-col items-center">
                 <Home size={48} className="text-amber-800 mb-2 opacity-90 drop-shadow-lg" strokeWidth={1} />
                 <div className="w-32 h-1 bg-black/40 blur-md rounded-full"></div>
             </div>
          </div>

          {/* Player Character */}
          <PlayerAvatar 
            x={playerPos.x} 
            y={playerPos.y} 
            isMoving={isMoving} 
            direction={direction}
          />

          {/* Captured Beasts (Companions) */}
          {capturedBeasts.map((beast, idx) => {
             const time = Date.now() / 2500;
             const bx = playerPos.x + Math.cos(time + idx) * 100;
             const by = playerPos.y + Math.sin(time + idx) * 60; // Elliptical orbit

             return (
               <div
                 key={beast.id}
                 className="absolute transition-all duration-300 beast-card"
                 style={{ 
                    top: by, 
                    left: bx, 
                    transform: 'translate(-50%, -90%)',
                    zIndex: Math.floor(by)
                 }}
               >
                 <BeastCard 
                    beast={beast}
                    viewMode="companion"
                    isSelected={selectedBeastId === beast.id}
                    onClick={(e) => { e?.stopPropagation(); selectBeast(beast.id); }}
                 />
               </div>
             );
          })}

          {/* Wild Beasts */}
          {wildBeasts.map(beast => (
              <div 
                key={beast.id}
                className="absolute transition-all duration-500 beast-card"
                style={{ 
                    top: beast.position.y, 
                    left: beast.position.x,
                    transform: 'translate(-50%, -90%)', // Anchor to feet
                    zIndex: Math.floor(beast.position.y) // Depth Sort
                }}
              >
                  <BeastCard 
                    beast={beast} 
                    viewMode="wild"
                    isSelected={selectedBeastId === beast.id}
                    onClick={(e) => { e?.stopPropagation(); selectBeast(beast.id); }}
                 />
              </div>
          ))}

          {/* Stylized Trees */}
          {Array.from({ length: 50 }).map((_, i) => {
             const tx = (i * 137) % WORLD_WIDTH;
             const ty = (i * 293) % WORLD_HEIGHT;
             const scale = 0.8 + (Math.random() * 0.7);
             return (
                <div 
                    key={`prop-${i}`}
                    className="absolute pointer-events-none opacity-90"
                    style={{
                        left: tx,
                        top: ty,
                        zIndex: ty + 20, // Trees overlap player if player is behind
                        transform: `translate(-50%, -100%) scale(${scale})`
                    }}
                >
                    {/* Painted Tree */}
                    <div className="w-4 h-32 bg-amber-950 mx-auto rounded-b-lg"></div>
                    <div className="w-48 h-48 bg-green-900 rounded-full -mt-24 filter blur-[2px] opacity-95 shadow-xl border-b-4 border-green-950"></div>
                    <div className="w-32 h-6 bg-black/40 blur-md absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[100%]"></div>
                </div>
             );
          })}
      </div>
    </div>
  )};

  const renderTraining = () => {
    const trainingBeast = beasts.find(b => b.id === trainingBeastId);
    const capturedBeasts = beasts.filter(b => b.isCaptured);

    // Animation classes
    let animClass = 'animate-breathe';
    if (trainingAnimation === 'attack') animClass = 'animate-bounce';
    if (trainingAnimation === 'run') animClass = 'animate-walk';
    if (trainingAnimation === 'magic') animClass = 'animate-pulse';

    return (
      <div className="min-h-screen flex flex-col bg-[#3f6212] relative overflow-hidden font-serif">
         {/* Background Texture - Dirt/Grass Field */}
         <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/dirt.png')]"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

         {/* Header */}
         <div className="relative z-10 p-6 flex justify-between items-start">
            <button 
              onClick={() => setView(ViewState.HOME)}
              className="px-4 py-2 bg-stone-900/80 border border-stone-700 text-stone-300 rounded hover:border-amber-500 hover:text-amber-500 transition-colors flex items-center gap-2"
            >
               <ArrowLeft size={16} /> <span className="font-cinzel text-xs uppercase tracking-widest">Return</span>
            </button>
            <h1 className="text-4xl font-cinzel text-amber-100 drop-shadow-md">Training Grounds</h1>
         </div>

         {/* Center Field (Stage) */}
         <div className="flex-1 flex flex-col items-center justify-center relative z-10 pb-32">
            {trainingBeast ? (
               <div className="relative group">
                  {/* Spotlight */}
                  <div className="absolute -inset-20 bg-yellow-500/10 blur-3xl rounded-full animate-pulse-soft"></div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/40 blur-md rounded-[100%]"></div>
                  
                  {/* The Beast */}
                  <div 
                    onClick={handleBeastClickInTraining}
                    className={`cursor-pointer transition-transform duration-300 ${animClass}`}
                  >
                     <img 
                       src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${trainingBeast.spriteId}.gif`} 
                       alt={trainingBeast.name}
                       className="w-64 h-64 object-contain drop-shadow-2xl"
                     />
                     
                     {/* Floating Stats */}
                     <div className="absolute -right-16 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-2 rounded backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-yellow-300 text-sm"><Zap size={14}/> {trainingBeast.stats.lightning}</div>
                        <div className="flex items-center gap-2 text-pink-300 text-sm"><Heart size={14}/> {trainingBeast.stats.love}</div>
                        <div className="flex items-center gap-2 text-blue-300 text-sm"><Shield size={14}/> {trainingBeast.stats.defense}</div>
                     </div>
                  </div>

                  {/* Training Menu Overlay */}
                  {showTrainingMenu && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900/90 border border-amber-800 p-4 rounded-lg flex gap-4 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <button onClick={() => executeTraining('attack')} className="flex flex-col items-center gap-2 p-3 hover:bg-stone-800 rounded transition-colors group/btn">
                           <div className="p-2 bg-red-900/50 rounded-full group-hover/btn:bg-red-600 transition-colors"><Zap className="text-red-200"/></div>
                           <span className="text-[10px] uppercase font-cinzel text-stone-300">Attack</span>
                        </button>
                        <button onClick={() => executeTraining('run')} className="flex flex-col items-center gap-2 p-3 hover:bg-stone-800 rounded transition-colors group/btn">
                           <div className="p-2 bg-blue-900/50 rounded-full group-hover/btn:bg-blue-600 transition-colors"><Shield className="text-blue-200"/></div>
                           <span className="text-[10px] uppercase font-cinzel text-stone-300">Defense</span>
                        </button>
                        <button onClick={() => executeTraining('magic')} className="flex flex-col items-center gap-2 p-3 hover:bg-stone-800 rounded transition-colors group/btn">
                           <div className="p-2 bg-pink-900/50 rounded-full group-hover/btn:bg-pink-600 transition-colors"><Heart className="text-pink-200"/></div>
                           <span className="text-[10px] uppercase font-cinzel text-stone-300">Magic</span>
                        </button>
                     </div>
                  )}

                  <p className="absolute -bottom-12 w-full text-center text-amber-200/60 font-cinzel text-sm animate-pulse">
                     {showTrainingMenu ? "Select Training" : "Click to Train"}
                  </p>
               </div>
            ) : (
               <div className="text-center opacity-50">
                  <Ghost size={64} className="mx-auto mb-4 text-stone-400" />
                  <p className="font-cinzel text-stone-300">Select a spirit from the cages below</p>
               </div>
            )}
         </div>

         {/* Cages Panel (Bottom) */}
         <div className="h-48 bg-stone-900/90 border-t border-stone-700 p-4 relative overflow-x-auto">
            <h3 className="text-stone-500 font-cinzel text-xs uppercase tracking-widest mb-3 sticky left-0">Captured Spirits</h3>
            <div className="flex gap-4 min-w-max px-2">
               {capturedBeasts.length === 0 ? (
                  <span className="text-stone-600 italic text-sm">No spirits captured yet. Explore the wilderness.</span>
               ) : (
                  capturedBeasts.map(beast => (
                     <div 
                        key={beast.id} 
                        onClick={() => handleCageSelect(beast.id)}
                        className={`
                           relative w-28 h-28 border-2 rounded-lg cursor-pointer transition-all overflow-hidden bg-stone-950
                           ${trainingBeastId === beast.id ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-stone-700 hover:border-stone-500'}
                        `}
                     >
                        {/* Bars Overlay */}
                        <div className="absolute inset-0 z-20 flex pointer-events-none">
                           <div className="w-1/4 h-full border-r border-stone-800/80"></div>
                           <div className="w-1/4 h-full border-r border-stone-800/80"></div>
                           <div className="w-1/4 h-full border-r border-stone-800/80"></div>
                        </div>
                        
                        {/* Beast Sprite inside Cage */}
                        <div className="absolute inset-0 flex items-center justify-center p-2 z-10">
                           <img 
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${beast.spriteId}.gif`} 
                              alt={beast.name}
                              className="w-full h-full object-contain filter grayscale contrast-125 opacity-70 hover:opacity-100 hover:grayscale-0 transition-all"
                           />
                        </div>
                        
                        {/* Name Tag */}
                        <div className="absolute bottom-0 w-full bg-black/80 text-[9px] text-center text-stone-400 font-cinzel py-1 z-30 uppercase">
                           {beast.name}
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
    );
  };

  const renderPlaceholder = (title: string, icon: React.ReactNode) => (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0a09] text-stone-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
          <div className="mb-8 p-8 border border-stone-800 rounded-full animate-float-heavy bg-stone-900/50 backdrop-blur-sm">{icon}</div>
          <h1 className="text-4xl font-cinzel mb-4 text-transparent bg-clip-text bg-gradient-to-b from-stone-200 to-stone-600">{title}</h1>
          <p className="text-stone-600 mb-12 italic font-serif">"The mists of time obscure this path..."</p>
          <button 
            onClick={() => setView(ViewState.HOME)}
            className="px-8 py-3 border border-stone-700 hover:border-amber-700 text-stone-400 hover:text-amber-500 rounded transition-all duration-300 font-cinzel uppercase tracking-widest text-xs"
          >
              Return
          </button>
      </div>
  );

  return (
    <div className="antialiased text-stone-200 selection:bg-amber-900/30 h-screen overflow-hidden">
      {view === ViewState.HOME && renderMainMenu()}
      {view === ViewState.WILDERNESS && renderWilderness()}
      {view === ViewState.COMBAT && renderPlaceholder("Combat Arena", <Swords size={64} className="text-red-900/50"/>)}
      {view === ViewState.TRAINING && renderTraining()}
    </div>
  );
};

export default App;