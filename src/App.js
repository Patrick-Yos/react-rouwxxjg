import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Users,
  Target,
  Trophy,
  Church,
  ShoppingBag,
  Star,
  Flame,
  Shield,
  Sword,
  Cpu,
  Droplet,
  Briefcase,
  Music,
  Menu,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageSquare,
  Globe,
  LogOut,
  Play,
  Pause,
  Gamepad2, // Added for Arcade
  Ghost,    // Added for Game
  Brain,    // Added for Game
  Timer,    // Added for Game
  XCircle, // Added for dice
  Dices, // Added for dice
} from 'lucide-react';

// --- NEW COMPONENT: WARP SPEED BACKGROUND ---
const WarpSpeedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Star properties
    const stars = [];
    const starCount = 400;
    
    class Star {
      constructor() {
        this.x = Math.random() * width - width / 2;
        this.y = Math.random() * height - height / 2;
        this.z = Math.random() * width; // Depth
        this.pz = this.z; // Previous z
      }

      update() {
        this.z = this.z - 15; // Speed of warp
        if (this.z < 1) {
          this.z = width;
          this.x = Math.random() * width - width / 2;
          this.y = Math.random() * height - height / 2;
          this.pz = this.z;
        }
      }

      draw() {
        const sx = (this.x / this.z) * width + width / 2;
        const sy = (this.y / this.z) * height + height / 2;

        const r = (width - this.z) / width * 2; // Radius based on depth

        // Previous position for trail effect (Anime.js style streaks)
        const px = (this.x / this.pz) * width + width / 2;
        const py = (this.y / this.pz) * height + height / 2;

        this.pz = this.z;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.lineWidth = Math.min(r, 3);
        // Cyan to Purple gradient stroke depending on depth
        const alpha = 1 - this.z / width;
        ctx.strokeStyle = `rgba(${100 + (255 - this.z / 4)}, ${200}, ${255}, ${alpha})`;
        ctx.stroke();
      }
    }

    // Init stars
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    const render = () => {
      // Create trails by not clearing completely (motion blur effect)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; 
      ctx.fillRect(0, 0, width, height);
      
      stars.forEach(star => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

// --- NEW COMPONENT: ARCADE OVERLAY ---
const ArcadeOverlay = ({ onClose }) => {
  const [activeGame, setActiveGame] = useState('menu'); // menu, whack, memory
  
  // -- WHACK A MOLE STATE --
  const [whackScore, setWhackScore] = useState(0);
  const [activeHole, setActiveHole] = useState(null);
  const [whackTime, setWhackTime] = useState(30);
  const [isWhackPlaying, setIsWhackPlaying] = useState(false);

  // -- MEMORY GAME STATE --
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  // WHACK LOGIC
  useEffect(() => {
    let interval;
    let timerInterval;
    if (activeGame === 'whack' && isWhackPlaying) {
      interval = setInterval(() => {
        const randomHole = Math.floor(Math.random() * 9);
        setActiveHole(randomHole);
      }, 700);

      timerInterval = setInterval(() => {
        setWhackTime((prev) => {
          if (prev <= 1) {
            setIsWhackPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [activeGame, isWhackPlaying]);

  const startWhack = () => {
    setWhackScore(0);
    setWhackTime(30);
    setIsWhackPlaying(true);
  };

  const handleWhack = (index) => {
    if (index === activeHole && isWhackPlaying) {
      setWhackScore(s => s + 10);
      setActiveHole(null); // Hide immediately
    }
  };

  // MEMORY LOGIC
  const initializeMemory = () => {
    const icons = [Zap, Star, Flame, Shield, Sword, Cpu, Ghost, Music];
    // Create pairs
    const deck = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((Icon, index) => ({ id: index, Icon }));
    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setMemoryMoves(0);
  };

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || solved.includes(id)) return;
    
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].Icon === cards[second].Icon) {
        setSolved([...solved, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-b from-indigo-900/50 to-purple-900/50 rounded-3xl border-4 border-cyan-500 shadow-[0_0_50px_rgba(34,211,238,0.5)] overflow-hidden flex flex-col">
        
        {/* Arcade Header */}
        <div className="p-6 border-b border-cyan-500/30 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-cyan-400 animate-pulse" />
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider">
              COSMIC ARCADE
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-8 h-8 text-cyan-400" />
          </button>
        </div>

        {/* Game Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* MENU */}
          {activeGame === 'menu' && (
            <div className="grid md:grid-cols-2 gap-8 h-full place-items-center">
              <button 
                onClick={() => { setActiveGame('whack'); startWhack(); }}
                className="group relative w-full h-64 bg-black/40 border-2 border-green-500/50 rounded-2xl hover:border-green-400 hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-4"
              >
                <Ghost className="w-20 h-20 text-green-400 group-hover:animate-bounce" />
                <h3 className="text-2xl font-bold text-green-300">WHACK-A-ALIEN</h3>
                <p className="text-green-500/70">Reflex Training</p>
              </button>

              <button 
                onClick={() => { setActiveGame('memory'); initializeMemory(); }}
                className="group relative w-full h-64 bg-black/40 border-2 border-pink-500/50 rounded-2xl hover:border-pink-400 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-4"
              >
                <Brain className="w-20 h-20 text-pink-400 group-hover:animate-spin" />
                <h3 className="text-2xl font-bold text-pink-300">MEMORY HACK</h3>
                <p className="text-pink-500/70">Neural Calibration</p>
              </button>
            </div>
          )}

          {/* WHACK GAME */}
          {activeGame === 'whack' && (
            <div className="h-full flex flex-col items-center">
              <div className="flex justify-between w-full mb-8 text-2xl font-mono">
                <div className="text-green-400">SCORE: {whackScore}</div>
                <div className="text-red-400 flex items-center gap-2"><Timer /> {whackTime}s</div>
              </div>
              
              {!isWhackPlaying && whackTime === 0 ? (
                <div className="text-center space-y-6">
                  <h3 className="text-4xl font-bold text-white">GAME OVER</h3>
                  <p className="text-2xl text-cyan-300">Final Score: {whackScore}</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={startWhack} className="px-6 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-500">PLAY AGAIN</button>
                    <button onClick={() => setActiveGame('menu')} className="px-6 py-3 bg-gray-600 rounded-lg font-bold hover:bg-gray-500">MENU</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => (
                    <div 
                      key={i}
                      onClick={() => handleWhack(i)}
                      className={`w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-full border-4 border-gray-600 flex items-center justify-center cursor-pointer relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-black/50 rounded-full shadow-inner"></div>
                      {activeHole === i && (
                        <Ghost className="w-16 h-16 text-green-400 animate-bounce relative z-10" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isWhackPlaying && <button onClick={() => setActiveGame('menu')} className="mt-8 text-sm text-gray-400 hover:text-white">Back to Menu</button>}
            </div>
          )}

          {/* MEMORY GAME */}
          {activeGame === 'memory' && (
            <div className="h-full flex flex-col items-center">
              <div className="flex justify-between w-full mb-6 text-2xl font-mono">
                <div className="text-pink-400">MOVES: {memoryMoves}</div>
                <div className="text-cyan-400">PAIRS: {solved.length / 2}/8</div>
              </div>

              {solved.length === cards.length && cards.length > 0 ? (
                 <div className="text-center space-y-6 mt-10">
                 <h3 className="text-4xl font-bold text-white">SYSTEM HACKED!</h3>
                 <p className="text-2xl text-cyan-300">Great Job Agent!</p>
                 <div className="flex gap-4 justify-center">
                   <button onClick={initializeMemory} className="px-6 py-3 bg-pink-600 rounded-lg font-bold hover:bg-pink-500">RETRY</button>
                   <button onClick={() => setActiveGame('menu')} className="px-6 py-3 bg-gray-600 rounded-lg font-bold hover:bg-gray-500">MENU</button>
                 </div>
               </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 md:gap-4">
                  {cards.map((card, index) => {
                    const isFlipped = flipped.includes(index) || solved.includes(index);
                    const CardIcon = card.Icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleCardClick(index)}
                        className={`w-16 h-16 md:w-24 md:h-24 rounded-xl transition-all duration-300 transform ${
                          isFlipped 
                            ? 'bg-gradient-to-br from-pink-600 to-purple-600 rotate-y-180' 
                            : 'bg-indigo-900/80 border-2 border-indigo-500/50 hover:border-indigo-400'
                        } flex items-center justify-center`}
                      >
                        {isFlipped ? (
                          <CardIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                        ) : (
                          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
               <button onClick={() => setActiveGame('menu')} className="mt-8 text-sm text-gray-400 hover:text-white">Back to Menu</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
//--Dice COMPONENT---
// --- NEW COMPONENT: FANTASTIC DICE ROLLER (ROBUST LOADER) ---
const DiceRoller = ({ onClose }) => {
  const [status, setStatus] = useState('loading'); // loading, ready, error
  const [pool, setPool] = useState([]); 
  const [rolling, setRolling] = useState(false);
  const [results, setResults] = useState(null);
  const [total, setTotal] = useState(0);
  const containerId = 'dice-box-container';
  const boxRef = useRef(null);

  // --- 1. SCRIPT INJECTION ---
  useEffect(() => {
    // If already loaded globally, skip injection
    if (window.DiceBox) {
      initDiceBox();
      return;
    }

    // Create a Blob script to bypass bundler restrictions
    // We use version 1.0.18 which is very stable
    const moduleCode = `
      import DiceBox from 'https://cdn.jsdelivr.net/npm/@3d-dice/dice-box@1.0.18/dist/dice-box.es.min.js';
      window.DiceBox = DiceBox;
      window.dispatchEvent(new Event('dicebox-ready'));
    `;

    const blob = new Blob([moduleCode], { type: 'application/javascript' });
    const scriptUrl = URL.createObjectURL(blob);
    const script = document.createElement('script');
    script.type = 'module';
    script.src = scriptUrl;
    document.body.appendChild(script);

    const handleReady = () => initDiceBox();
    window.addEventListener('dicebox-ready', handleReady);

    return () => {
      window.removeEventListener('dicebox-ready', handleReady);
      URL.revokeObjectURL(scriptUrl);
    };
  }, []);

  // --- 2. INITIALIZATION LOGIC ---
  const initDiceBox = async () => {
    // Safety check: Ensure the container div exists in the DOM
    const container = document.getElementById(containerId);
    if (!container) {
        setTimeout(initDiceBox, 100); // Retry if React hasn't rendered div yet
        return;
    }

    if (boxRef.current) return;

    try {
      // Initialize with JSDELIVR assets (Faster & CORS friendly)
      const Box = new window.DiceBox("#" + containerId, {
        assetPath: "https://cdn.jsdelivr.net/npm/@3d-dice/dice-box@1.0.18/dist/assets/",
        theme: "default",
        themeColor: "#06b6d4", // Cyan
        scale: 6,
        offscreen: true // Important for performance
      });

      await Box.init();
      boxRef.current = Box;
      setStatus('ready');

      // Setup Results Handler
      Box.onRollComplete = (rollResults) => {
        let sum = 0;
        const resArray = [];
        
        // Handle differences in result format between versions
        const rolls = Array.isArray(rollResults) ? rollResults : [rollResults];
        
        rolls.forEach(r => {
           // r.value is the result, r.groupId is the dice type usually
           // We fallback to checking the inputs if type is missing
           let val = r.value;
           sum += val;
           // Attempt to guess type from sides if explicit type is missing
           let type = r.sides ? `d${r.sides}` : 'die';
           resArray.push({ type: type, value: val });
        });

        setResults(resArray);
        setTotal(sum);
        
        // Auto vanish results after 6s
        setTimeout(() => {
            if (boxRef.current) boxRef.current.clear();
            setResults(null);
            setTotal(0);
            setRolling(false);
        }, 6000);
      };

    } catch (error) {
      console.error("DiceBox Init Error:", error);
      setStatus('error');
    }
  };

  const addToPool = (type) => {
    if (rolling) return;
    setPool([...pool, type]);
  };

  const clearPool = () => {
    if (rolling) return;
    setPool([]);
  };

  const rollDice = async () => {
    if (!boxRef.current || pool.length === 0 || rolling) return;
    
    setRolling(true);
    setResults(null);
    setTotal(0);

    // Format: Array of strings ["d20", "d6", "d10"]
    // d1000 is simulated as 3d10
    const finalPool = [];
    pool.forEach(die => {
        if (die === 'd1000') {
            finalPool.push('d10', 'd10', 'd10');
        } else {
            finalPool.push(die);
        }
    });

    try {
        await boxRef.current.roll(finalPool);
    } catch (e) {
        console.error("Roll failed", e);
        setRolling(false);
    }
  };

  const diceOptions = [
    { type: 'd4', label: 'D4' },
    { type: 'd6', label: 'D6' },
    { type: 'd8', label: 'D8' },
    { type: 'd10', label: 'D10' },
    { type: 'd12', label: 'D12' },
    { type: 'd20', label: 'D20' },
    { type: 'd100', label: 'D100' },
    { type: 'd1000', label: 'D1K' }, 
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center pointer-events-none">
        
        {/* CLICK TO CLOSE (Background) */}
        <div className="absolute inset-0 z-0 pointer-events-auto" onClick={(e) => {
            if (e.target === e.currentTarget && !rolling) onClose();
        }}></div>

        {/* 3D CANVAS LAYER */}
        <div 
            id={containerId} 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
        />

        {/* UI CONTROLS LAYER */}
        <div className="relative z-20 mb-8 pointer-events-auto flex flex-col items-center gap-4 animate-in slide-in-from-bottom-10 duration-500">
            
            {/* RESULTS DISPLAY */}
            {results && (
                <div className="bg-black/80 backdrop-blur-xl border-2 border-cyan-500 p-6 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.6)] flex flex-col items-center gap-2 min-w-[300px] animate-in zoom-in duration-300">
                    <h3 className="text-cyan-400 font-bold tracking-widest text-sm">TOTAL RESULT</h3>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 drop-shadow-sm">
                        {total}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-md">
                        {results.map((r, i) => (
                            <span key={i} className="px-2 py-1 bg-white/10 rounded text-sm text-cyan-200 font-mono">
                                {r.type}: {r.value}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* SELECTION WIDGET */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 max-w-3xl mx-4">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                         <Dices className="text-cyan-400 w-5 h-5" />
                         <span className="font-bold text-white">COSMIC ROLLER</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XCircle /></button>
                </div>

                {/* DICE GRID */}
                <div className="flex flex-wrap justify-center gap-3">
                    {diceOptions.map((opt) => (
                        <button
                            key={opt.type}
                            onClick={() => addToPool(opt.type)}
                            disabled={status !== 'ready' || rolling}
                            className="group relative w-14 h-14 bg-black/50 rounded-xl border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-900/50 transition-all active:scale-95 disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                        >
                            <span className="text-xs font-bold text-cyan-100">{opt.label}</span>
                            <div className={`w-2 h-2 rounded-full ${pool.filter(p => p === opt.type).length > 0 ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-gray-600'}`}></div>
                            
                            {pool.filter(p => p === opt.type).length > 0 && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/20">
                                    {pool.filter(p => p === opt.type).length}
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* ACTION BAR */}
                <div className="flex gap-3">
                    <button 
                        onClick={clearPool}
                        disabled={pool.length === 0 || rolling}
                        className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 hover:bg-red-900/50 transition-colors disabled:opacity-30"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    
                    <button
                        onClick={rollDice}
                        disabled={pool.length === 0 || rolling || status !== 'ready'}
                        className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl font-bold text-lg hover:from-cyan-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {rolling ? (
                            <span className="animate-pulse">ROLLING...</span>
                        ) : (
                            <>
                                ROLL DICE <Dices className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
                
                {/* STATUS INDICATOR */}
                {status === 'loading' && (
                    <div className="text-center text-xs text-yellow-500 animate-pulse">
                        <span className="inline-block animate-spin mr-2">⚙️</span>
                        Initializing Physics...
                    </div>
                )}
                {status === 'error' && (
                    <div className="text-center text-xs text-red-400">
                        Failed to load Physics Engine. Please refresh.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
// --- DICE COMPONENT ---

// --- MAIN COMPONENT ---
const CosmicSyndicate = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Gloria',
      rating: 4,
      comment: 'I guess they are okay',
      date: 'Cosmic Year 2024.7',
    },
  ]);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: '',
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCareers, setShowCareers] = useState(false);
  const [showOperations, setShowOperations] = useState(false);
  const [showArcade, setShowArcade] = useState(false); // NEW ARCADE STATE
  const [showDiceRoller, setShowDiceRoller] = useState(false); // NEW DICE STATE
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    fullName: '',
    expiryDate: '',
    cvv: '',
  });
  const [careerForm, setCareerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    position: '',
    summary: '',
    resume: null,
  });
  const [showShootingStar, setShowShootingStar] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // PAUSE STATE
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  const mountRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Toggle Pause Function
  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    isPausedRef.current = newState;
  };

  // --- 3D SOLAR SYSTEM LOGIC ---
  useEffect(() => {
    if (!showOperations || !mountRef.current) return;

    let scene, camera, renderer, controls, animationId;
    let planets = [];
    let raycaster, mouse;
    let targetCameraPos = null; 
    let targetLookAt = null;

    setIsPaused(false);
    isPausedRef.current = false;

    // Helper: Create Text Sprite
    const createLabel = (text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256; canvas.height = 64;
        context.font = 'Bold 24px Arial';
        context.fillStyle = 'rgba(255,255,255,1)';
        context.strokeStyle = 'rgba(0,0,0,0.8)';
        context.lineWidth = 4;
        context.textAlign = 'center';
        context.strokeText(text, 128, 32);
        context.fillText(text, 128, 32);
        
        const texture = new window.THREE.CanvasTexture(canvas);
        const material = new window.THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new window.THREE.Sprite(material);
        sprite.scale.set(20, 5, 1);
        return sprite;
    };

    const loadThreeJS = async () => {
      if (window.THREE && window.THREE.OrbitControls) { initSolarSystem(); return; }
      const scriptMain = document.createElement('script');
      scriptMain.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      scriptMain.async = true;
      scriptMain.onload = () => {
        const scriptControls = document.createElement('script');
        scriptControls.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
        scriptControls.async = true;
        scriptControls.onload = () => { initSolarSystem(); };
        document.head.appendChild(scriptControls);
      };
      document.head.appendChild(scriptMain);
    };

    const initSolarSystem = () => {
      const THREE = window.THREE;
      const container = mountRef.current;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.002);

      camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
      camera.position.set(0, 150, 300);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enablePan = false;
      controls.minDistance = 20;
      controls.maxDistance = 800;

      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientLight);
      const sunLight = new THREE.PointLight(0xffaa00, 1.5, 1000);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      // SUN
      const sunGeo = new THREE.SphereGeometry(15, 64, 64);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      scene.add(sunMesh);

      // Sun Glow
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 100, 0, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 50, 0, 0.6)');
      gradient.addColorStop(0.5, 'rgba(100, 20, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
      const glowMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), color: 0xff5500, transparent: true, blending: THREE.AdditiveBlending });
      const sunGlow = new THREE.Sprite(glowMat);
      sunGlow.scale.set(80, 80, 1);
      sunMesh.add(sunGlow);

      // PLANETS DATA
      const planetsData = [
        { name: 'Sulfur', distance: 60, size: 4, speed: 0.005, color: 0xd97706, desc: 'Desert world - rocky terrain, sulfur lakes.', mat: { roughness: 0.9, metalness: 0.1 } },
        { name: 'Rodina', distance: 90, size: 6, speed: 0.004, color: 0x3b82f6, desc: 'Earthy paradise.', mat: { roughness: 0.4, metalness: 0.1, emissive: 0x001133 } },
        { name: 'Cupie', distance: 130, size: 7, speed: 0.003, color: 0xa855f7, desc: 'Two merging planets with a chaotic asteroid field.', type: 'dual-merge' },
        { name: 'Apatia', distance: 170, size: 5.5, speed: 0.0025, color: 0x06b6d4, desc: 'Earth with a twist.', mat: { roughness: 0.3, metalness: 0.2 } },
        { name: 'The March', distance: 210, size: 6.5, speed: 0.002, color: 0x6b7280, desc: 'Abandoned military world.', mat: { roughness: 1.0, metalness: 0.5 } },
        { name: 'The Wilds', distance: 250, size: 8, speed: 0.0015, color: 0x10b981, desc: 'Amazon forest planet.', mat: { roughness: 0.8, emissive: 0x002200 } },
        { name: 'Phantoma', distance: 300, size: 7, speed: 0.001, color: 0xffffff, desc: 'Ghost planet with moon.', hasMoon: true, isGhost: true },
      ];

      planetsData.forEach((data) => {
        // Orbit Line
        const orbitGeo = new THREE.RingGeometry(data.distance - 0.3, data.distance + 0.3, 128);
        const orbitMat = new THREE.MeshBasicMaterial({ color: 0x666666, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
        const orbit = new THREE.Mesh(orbitGeo, orbitMat);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);

        // Planet Group/Mesh
        let mainMesh;
        if (data.type === 'dual-merge') {
            mainMesh = new THREE.Group();
            const geoA = new THREE.SphereGeometry(data.size * 0.6, 32, 32);
            const matA = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.7 });
            const planetA = new THREE.Mesh(geoA, matA); planetA.position.set(-2.5, 0, 0);
            const geoB = new THREE.SphereGeometry(data.size * 0.7, 32, 32);
            const matB = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.6 });
            const planetB = new THREE.Mesh(geoB, matB); planetB.position.set(2.5, 0, 0);
            mainMesh.add(planetA); mainMesh.add(planetB);

            // Asteroids
            const count = 600; const pos = new Float32Array(count*3);
            for(let i=0; i<count; i++) {
                const a = Math.random()*Math.PI*2; const r = 6+Math.random()*4;
                pos[i*3] = Math.cos(a)*r; pos[i*3+1] = (Math.random()-0.5)*1.5; pos[i*3+2] = Math.sin(a)*r;
            }
            const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const pMat = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.3 });
            const belt = new THREE.Points(pGeo, pMat); belt.rotation.x = Math.PI/6; belt.rotation.y = Math.PI/6;
            mainMesh.add(belt);
            mainMesh.userData = { ...data };
        } else {
            const geo = new THREE.SphereGeometry(data.size, 32, 32);
            let mat;
            if (data.isGhost) mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, transmission: 0.6, roughness: 0.2, metalness: 0.1 });
            else mat = new THREE.MeshStandardMaterial({ color: data.color, ...data.mat });
            mainMesh = new THREE.Mesh(geo, mat);
            mainMesh.userData = { ...data };
        }
        scene.add(mainMesh);

        // Add Label
        const label = createLabel(data.name);
        label.position.set(0, data.size + 3, 0); // Position above planet
        mainMesh.add(label);

        // Moon
        let moonPivot = null;
        if (data.hasMoon) {
          moonPivot = new THREE.Object3D();
          mainMesh.add(moonPivot);
          const moon = new THREE.Mesh(new THREE.SphereGeometry(data.size * 0.35, 16, 16), new THREE.MeshStandardMaterial({ color: 0x888888 }));
          moon.position.set(12, 0, 0);
          moonPivot.add(moon);
        }

        const angle = Math.random() * Math.PI * 2;
        planets.push({ mesh: mainMesh, distance: data.distance, speed: data.speed, angle: angle, moonPivot: moonPivot, type: data.type });
      });

      // RAYCASTER & ZOOM
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      const onMouseClick = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const hit = intersects.find(i => i.object.userData && (i.object.userData.name || i.object.userData.desc));
        
        if (hit) {
          const planetData = hit.object.parent?.userData?.name ? hit.object.parent.userData : hit.object.userData;
          setSelectedPlanet(planetData);
          
          // --- ZOOM LOGIC ---
          // 1. Pause rotation so planet stays still for reading
          setIsPaused(true);
          isPausedRef.current = true;

          // 2. Calculate target position (Planet Position + Offset)
          const planetPos = new THREE.Vector3();
          // Use parent if it's a child mesh (like dual planet parts)
          const targetObj = hit.object.parent?.type === 'Group' ? hit.object.parent : hit.object;
          targetObj.getWorldPosition(planetPos);

          // New Camera Position: Planet Pos + Offset
          targetCameraPos = planetPos.clone().add(new THREE.Vector3(15, 10, 20)); // Closer zoom
          targetLookAt = planetPos.clone();
          
          // Update orbit controls target to pivot around this planet
          controls.target.copy(targetLookAt);
        }
      };

      renderer.domElement.addEventListener('click', onMouseClick);

      // ANIMATION
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        controls.update();

        // Handle Zoom Animation (Lerp)
        if (targetCameraPos && targetLookAt) {
            camera.position.lerp(targetCameraPos, 0.05);
            // controls.target is updated instantly on click, but we ensure camera looks at it
            camera.lookAt(controls.target); 
        }

        const time = Date.now() * 0.001;
        sunGlow.scale.set(80 + Math.sin(time) * 5, 80 + Math.sin(time) * 5, 1);

        if (!isPausedRef.current) {
          planets.forEach(p => {
            p.angle += p.speed;
            p.mesh.position.x = Math.cos(p.angle) * p.distance;
            p.mesh.position.z = Math.sin(p.angle) * p.distance;
            p.mesh.rotation.y += 0.005;
            if (p.type === 'dual-merge') p.mesh.rotation.z += 0.002;
            if (p.moonPivot) p.moonPivot.rotation.y += 0.03;
          });
        }
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        if (container) container.innerHTML = '';
        renderer.dispose();
      };
    };

    loadThreeJS();
  }, [showOperations]);

  // --- STANDARD FUNCTIONS ---
  const scrollToSection = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
    setTimeout(() => setCartOpen(false), 2000);
  };

  const removeFromCart = (itemName) => {
    setCart((prev) => prev.filter((i) => i.name !== itemName));
  };

  const updateQuantity = (itemName, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.name === itemName) {
            const newQuantity = i.quantity + delta;
            return newQuantity > 0 ? { ...i, quantity: newQuantity } : i;
          }
          return i;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (sum, item) =>
        sum + parseInt(item.price.replace(/,/g, '')) * item.quantity,
      0
    );
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (newReview.name && newReview.comment) {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setReviews((prev) => [
        ...prev,
        { ...newReview, id: Date.now(), date: `Cosmic Year ${formattedDate}` },
      ]);
      setNewReview({ name: '', rating: 5, comment: '' });
      setTimeout(
        () =>
          document
            .getElementById('reviews')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100
      );
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    document.getElementById('cart-drawer')?.classList.add('translate-x-full');
    setShowCheckout(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setCart([]);
    setShowPaymentSuccess(true);
    setTimeout(() => {
      setShowCheckout(false);
      setShowPaymentSuccess(false);
      setPaymentForm({ cardNumber: '', fullName: '', expiryDate: '', cvv: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 5000);
  };

  const handleCareerSubmit = (e) => {
    e.preventDefault();
    setCareerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationalId: '',
      position: '',
      summary: '',
      resume: null,
    });
    const fileInput = document.getElementById('resume-upload');
    if (fileInput) fileInput.value = '';
    setShowShootingStar(true);
    setTimeout(() => setShowShootingStar(false), 2500);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCareerForm({ ...careerForm, resume: e.target.files[0] });
    }
  };

  const ShootingStar = () => (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <div
        className="absolute animate-[shooting-star_2s_ease-out]"
        style={{
          top: '10%',
          left: '-10%',
          animation: 'shooting-star 2s ease-out forwards',
        }}
      >
        <div className="relative">
          <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-60 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-transparent blur-sm" />
        </div>
      </div>
      <style>{`@keyframes shooting-star { 0% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 100% { transform: translate(120vw, 80vh) rotate(45deg); opacity: 0; } }`}</style>
    </div>
  );

  const MenuItem = ({ icon: Icon, text, section }) => (
    <button
      onClick={() => scrollToSection(section)}
      className={`group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
        activeSection === section
          ? 'border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.6)]'
          : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
          {text}
        </span>
      </div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity -z-10" />
    </button>
  );

  const TeamMember = ({ name, title, description, icon: Icon, color }) => (
    <div
      className={`group relative p-8 bg-gradient-to-br ${color} rounded-2xl border-2 border-cyan-400/30 backdrop-blur-md hover:border-cyan-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all duration-500 transform hover:scale-105`}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity -z-10" />
      <div className="flex items-start gap-4 mb-4">
        <div className="p-4 bg-black/40 rounded-xl border border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]">
          <Icon className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2">
            {name}
          </h3>
          <p className="text-cyan-400 font-semibold text-lg italic">{title}</p>
        </div>
      </div>
      <div className="text-cyan-50 leading-relaxed space-y-2">
        {description}
      </div>
    </div>
  );

  const SuccessStory = ({ title, description, icon: Icon }) => (
    <div className="group relative p-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border-2 border-purple-400/30 backdrop-blur-sm hover:border-purple-300 hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all duration-500">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
          {title}
        </h3>
      </div>
      <div className="text-purple-100 leading-relaxed">{description}</div>
    </div>
  );

  const MerchItem = ({ name, price, icon: Icon }) => (
    <div className="group relative p-6 bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl border-2 border-amber-400/40 backdrop-blur-sm hover:border-amber-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-8 h-8 text-amber-400 group-hover:text-amber-300" />
        <span className="text-2xl font-bold text-amber-400">{price} ◈</span>
      </div>
      <h4 className="text-lg font-semibold text-amber-100 group-hover:text-white transition-colors mb-4">
        {name}
      </h4>
      <button
        onClick={() => addToCart({ name, price, icon: Icon })}
        className="w-full py-2 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
      >
        <ShoppingCart className="w-4 h-4" /> Add to Cart
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-indigo-950 to-purple-950 text-white overflow-x-hidden relative">
      {/* REPLACED STATIC STARFIELD WITH WARP SPEED BACKGROUND */}
      <WarpSpeedBackground />
      {showShootingStar && <ShootingStar />}

      {/* ARCADE OVERLAY */}
      {showArcade && <ArcadeOverlay onClose={() => setShowArcade(false)} />}
      {/* --- PASTE THIS HERE --- */}
      {/* DICE ROLLER OVERLAY */}
      {showDiceRoller && <DiceRoller onClose={() => setShowDiceRoller(false)} />}
      {/* ----------------------- */}

      {/* Checkout Page Overlay */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg overflow-y-auto">
          <div className="min-h-screen py-20 px-4">
            <div className="max-w-3xl mx-auto">
              {!showPaymentSuccess ? (
                <div className="relative p-12 bg-gradient-to-br from-cyan-900/60 to-purple-900/60 rounded-3xl border-2 border-cyan-400/50 backdrop-blur-lg shadow-[0_0_80px_rgba(34,211,238,0.6)]">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-2xl animate-pulse" />
                  <div className="relative space-y-8">
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="absolute top-0 right-0 p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <X className="w-8 h-8" />
                    </button>
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <Sparkles className="w-16 h-16 text-cyan-400 animate-pulse" />
                      </div>
                      <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                        INTERSTELLAR PAYMENT PROCESSING TERMINAL
                      </h2>
                      <p className="text-xl text-cyan-200 italic">
                        Where cosmic credits meet quantum transactions
                      </p>
                    </div>
                    <div className="p-6 bg-black/40 rounded-xl border border-cyan-400/30">
                      <div className="flex justify-between items-center text-xl">
                        <span className="text-cyan-300 font-bold">
                          Total Amount:
                        </span>
                        <span className="text-amber-300 font-black text-3xl">
                          {getTotalPrice().toLocaleString()} ◈
                        </span>
                      </div>
                    </div>
                    <form onSubmit={handlePayment} className="space-y-6">
                      <div>
                        <label className="block text-cyan-300 font-semibold mb-2 text-lg">
                          Bank Card ID / Card Number
                        </label>
                        <input
                          type="text"
                          value={paymentForm.cardNumber}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              cardNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors text-lg font-mono"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-cyan-300 font-semibold mb-2 text-lg">
                          Full Name on Card
                        </label>
                        <input
                          type="text"
                          value={paymentForm.fullName}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors text-lg"
                          placeholder="COSMIC TRAVELER"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-cyan-300 font-semibold mb-2 text-lg">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={paymentForm.expiryDate}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                expiryDate: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors text-lg font-mono"
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-cyan-300 font-semibold mb-2 text-lg">
                            Security Code (CVV)
                          </label>
                          <input
                            type="text"
                            value={paymentForm.cvv}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                cvv: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors text-lg font-mono"
                            placeholder="***"
                            maxLength="3"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-5 px-8 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black text-2xl rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(34,211,238,0.5)] hover:shadow-[0_0_60px_rgba(34,211,238,0.8)] transform hover:scale-105 border-2 border-cyan-400/50"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Zap className="w-8 h-8" /> PROCESS PAYMENT{' '}
                          <Zap className="w-8 h-8" />
                        </div>
                      </button>
                    </form>
                    <div className="text-center text-sm text-cyan-400 italic space-y-1">
                      <p>⚡ Powered by Quantum Encryption Technology ⚡</p>
                      <p>🌌 Your transaction is secured by cosmic forces 🌌</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative p-12 bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-3xl border-2 border-green-400/50 backdrop-blur-lg shadow-[0_0_80px_rgba(34,197,94,0.6)] animate-pulse">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-3xl opacity-30 blur-2xl animate-pulse" />
                  <div className="relative text-center space-y-6">
                    <div className="flex justify-center">
                      <Trophy className="w-24 h-24 text-green-400 animate-bounce" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                      YOUR PAYMENT IS BEING PROCESSED!
                    </h2>
                    <div className="space-y-4 text-xl text-green-100">
                      <p className="font-bold text-2xl">
                        ✨ Thank you for supporting us, brave cosmic patron! ✨
                      </p>
                      <p className="italic">
                        Your credits are being transmitted across seventeen
                        dimensions...
                      </p>
                      <p className="text-green-300 font-semibold text-2xl animate-pulse">
                        Please be sure to pay again! 😄🚀💫
                      </p>
                    </div>
                    <div className="flex justify-center gap-4 pt-4">
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                      <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Area of Operations - Solar System */}
      {showOperations && (
        // Added z-[100] to fix overlap with nav
        <div className="fixed inset-0 z-[100] bg-black">
          {/* UPDATED: Top Right Control Panel */}
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
            <button
              onClick={() => {
                setShowOperations(false);
                setSelectedPlanet(null);
              }}
              className="px-6 py-3 bg-red-600/90 hover:bg-red-500 text-white font-bold rounded-lg border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2 transition-all transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              RETURN TO BASE
            </button>

            <button
              onClick={togglePause}
              className={`px-6 py-3 font-bold rounded-lg border-2 flex items-center justify-center gap-2 transition-all transform hover:scale-105 ${
                isPaused
                  ? 'bg-yellow-600/90 hover:bg-yellow-500 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.6)]'
                  : 'bg-green-600/90 hover:bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
              }`}
            >
              {isPaused ? (
                <Play className="w-5 h-5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
              {isPaused ? 'RESUME ORBITS' : 'PAUSE ORBITS'}
            </button>
          </div>

          <div className="absolute top-4 left-4 z-10 p-4 bg-black/80 backdrop-blur-lg rounded-xl border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2">
              AREA OF OPERATIONS
            </h2>
            <p className="text-sm text-cyan-200">
              🖱️ Click planets • Drag to rotate • Scroll to zoom
            </p>
          </div>

          <div
            ref={mountRef}
            className="w-full h-full"
            style={{ cursor: 'grab' }}
          />

          {selectedPlanet && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 z-10 p-6 bg-black/90 backdrop-blur-lg rounded-xl border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.5)] animate-[fadeInScale_0.3s_ease-out]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                  {selectedPlanet.name.toUpperCase()}
                </h3>
                <button
                  onClick={() => setSelectedPlanet(null)}
                  className="p-1 hover:bg-cyan-500/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-cyan-400" />
                </button>
              </div>
              <div className="space-y-3 text-cyan-100">
                <p className="text-sm leading-relaxed">{selectedPlanet.desc}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-cyan-900/30 rounded border border-cyan-400/30">
                    <span className="text-cyan-400 font-bold">Distance:</span>
                    <br />
                    {selectedPlanet.distance * 10}M km
                  </div>
                  <div className="p-2 bg-cyan-900/30 rounded border border-cyan-400/30">
                    <span className="text-cyan-400 font-bold">Size:</span>
                    <br />
                    {selectedPlanet.size * 1000} km
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Careers Page Overlay */}
      {showCareers && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg overflow-y-auto">
          <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative p-12 bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-3xl border-2 border-purple-400/50 backdrop-blur-lg shadow-[0_0_80px_rgba(168,85,247,0.6)]">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl opacity-30 blur-2xl animate-pulse" />
                <div className="relative space-y-8">
                  <button
                    onClick={() => setShowCareers(false)}
                    className="absolute top-0 right-0 p-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-4">
                      <Users className="w-16 h-16 text-purple-400 animate-pulse" />
                      <Sparkles className="w-16 h-16 text-pink-400 animate-pulse" />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                      CAREERS
                    </h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                      Join the Cosmic Madness!
                    </h3>
                  </div>
                  <div className="p-8 bg-black/40 rounded-xl border border-purple-400/40 space-y-4 text-lg text-purple-100 leading-relaxed">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                      Want to join the madness and the fun of saving the
                      universe? 🌌
                    </p>
                    <p>
                      Do you feel the{' '}
                      <span className="text-pink-300 font-semibold">
                        cosmic itch for adventure
                      </span>
                      , chaos, heroism, and{' '}
                      <em className="text-purple-300">
                        very questionable decision-making
                      </em>
                      ?
                    </p>
                    <p>
                      If you are mad enough to consider joining us… we might as
                      well give it a look! 🚀✨
                    </p>
                  </div>
                  {showShootingStar && (
                    <div className="p-8 bg-gradient-to-r from-green-900/90 to-emerald-900/90 rounded-xl border-2 border-green-400 text-center shadow-[0_0_40px_rgba(34,197,94,0.7)] animate-[fadeInScale_0.5s_ease-out]">
                      <div className="flex justify-center mb-4">
                        <Sparkles className="w-12 h-12 text-green-300 animate-spin" />
                      </div>
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 mb-2">
                        ✨ APPLICATION SENT! ✨
                      </p>
                      <p className="text-xl text-green-100 font-semibold">
                        Your application has been sent successfully through the
                        astral networks!
                      </p>
                    </div>
                  )}
                  <style>{`@keyframes fadeInScale { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }`}</style>
                  <form onSubmit={handleCareerSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-purple-300 font-semibold mb-2 text-lg">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={careerForm.firstName}
                          onChange={(e) =>
                            setCareerForm({
                              ...careerForm,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-purple-300 font-semibold mb-2 text-lg">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={careerForm.lastName}
                          onChange={(e) =>
                            setCareerForm({
                              ...careerForm,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={careerForm.email}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Cosmic Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={careerForm.phone}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        National ID *
                      </label>
                      <input
                        type="text"
                        value={careerForm.nationalId}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            nationalId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Position Interested In *
                      </label>
                      <select
                        value={careerForm.position}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            position: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                        required
                      >
                        <option value="">Select a position...</option>
                        <option value="warrior">🗡️ Cosmic Warrior</option>
                        <option value="engineer">⚙️ Quantum Engineer</option>
                        <option value="infiltrator">
                          👤 Shadow Infiltrator
                        </option>
                        <option value="manager">💼 Business Manager</option>
                        <option value="musician">🎸 Rockstar Operative</option>
                        <option value="diplomat">
                          🤝 Intergalactic Diplomat
                        </option>
                        <option value="scientist">🔬 Mad Scientist</option>
                        <option value="other">✨ Other (Surprise us!)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Small Summary About Yourself *
                      </label>
                      <textarea
                        value={careerForm.summary}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            summary: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg h-32 resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Resume / Attachment *
                      </label>
                      <input
                        id="resume-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-500 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                        accept=".pdf,.doc,.docx,.txt"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-5 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-2xl rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_rgba(168,85,247,0.8)] transform hover:scale-105 border-2 border-purple-400/50"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8" /> SUBMIT APPLICATION{' '}
                        <Sparkles className="w-8 h-8" />
                      </div>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Popup */}
      {cartOpen && (
        <div className="fixed top-20 right-4 z-50 p-6 bg-gradient-to-br from-amber-900/95 to-orange-900/95 rounded-xl border-2 border-amber-400 backdrop-blur-lg shadow-[0_0_40px_rgba(251,191,36,0.6)] animate-bounce">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-amber-300" />
            <span className="text-amber-100 font-semibold">Added to cart!</span>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => {
          const cartSection = document.getElementById('cart-drawer');
          cartSection?.classList.toggle('translate-x-full');
        }}
        className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:shadow-[0_0_40px_rgba(251,191,36,0.7)] transition-all duration-300 transform hover:scale-110"
      >
        <ShoppingCart className="w-6 h-6 text-white" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      <div
        id="cart-drawer"
        className="fixed top-0 right-0 h-full w-full md:w-96 bg-gradient-to-b from-amber-900/98 to-orange-900/98 backdrop-blur-lg border-l-2 border-amber-400/50 z-40 transform translate-x-full transition-transform duration-300 overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-amber-400/30 pb-4">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
              Your Cart
            </h2>
            <button
              onClick={() =>
                document
                  .getElementById('cart-drawer')
                  ?.classList.add('translate-x-full')
              }
              className="p-2 hover:bg-amber-800/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-amber-300" />
            </button>
          </div>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
              <p className="text-amber-300 text-lg">Your cart is empty</p>
              <p className="text-amber-400/70 text-sm mt-2">
                Add some legendary merch!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.name}
                    className="p-4 bg-black/40 rounded-lg border border-amber-400/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-amber-100 font-semibold">
                          {item.name}
                        </h3>
                        <p className="text-amber-400 text-lg font-bold">
                          {item.price} ◈ each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.name)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.name, -1)}
                          className="p-1 bg-amber-800/50 hover:bg-amber-700/50 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-amber-300" />
                        </button>
                        <span className="text-amber-100 font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.name, 1)}
                          className="p-1 bg-amber-800/50 hover:bg-amber-700/50 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-amber-300" />
                        </button>
                      </div>
                      <p className="text-amber-300 font-bold">
                        {(
                          parseInt(item.price.replace(/,/g, '')) * item.quantity
                        ).toLocaleString()}{' '}
                        ◈
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-amber-400/30 pt-4">
                <div className="flex items-center justify-between text-xl font-bold mb-4">
                  <span className="text-amber-300">Total:</span>
                  <span className="text-amber-100">
                    {getTotalPrice().toLocaleString()} ◈
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-lg rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transform hover:scale-105"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 backdrop-blur-md bg-black/30 border-b border-cyan-400/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
              COSMIC SYNDICATE
            </span>
          </div>
          <div className="hidden lg:flex gap-3">
            <MenuItem icon={Users} text="Our Team" section="team" />
            <MenuItem icon={Target} text="Mission & Vision" section="mission" />
            <MenuItem icon={Trophy} text="Success Stories" section="stories" />
            <MenuItem icon={Church} text="The Church" section="church" />
            <MenuItem icon={ShoppingBag} text="Merch" section="merch" />
            <MenuItem icon={MessageSquare} text="Reviews" section="reviews" />
            
            {/* ARCADE BUTTON DESKTOP */}
            <button
              onClick={() => setShowArcade(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-2 border-pink-400/50 rounded-lg backdrop-blur-sm hover:border-pink-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
                <span className="text-pink-100 font-semibold group-hover:text-white transition-colors">
                  ARCADE
                </span>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity -z-10" />
            </button>
{/* DICE ROLLER BUTTON */}
            <button
              onClick={() => setShowDiceRoller(true)}
              className="p-3 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-cyan-500/30 rounded-lg hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all transform hover:scale-105"
              title="Roll Dice">
              <Dices className="w-6 h-6 text-cyan-300" />
            </button>
            <button
              onClick={() => setShowOperations(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Area of Operations
                </span>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity -z-10" />
            </button>
            <button
              onClick={() => setShowCareers(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Careers
                </span>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity -z-10" />
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-cyan-400 hover:text-cyan-300"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 space-y-2">
            <MenuItem icon={Users} text="Our Team" section="team" />
            <MenuItem icon={Target} text="Mission & Vision" section="mission" />
            <MenuItem icon={Trophy} text="Success Stories" section="stories" />
            <MenuItem icon={Church} text="The Church" section="church" />
            <MenuItem icon={ShoppingBag} text="Merch" section="merch" />
            <MenuItem icon={MessageSquare} text="Reviews" section="reviews" />
            
            {/* ARCADE BUTTON MOBILE */}
            <button
              onClick={() => {
                setShowArcade(true);
                setMobileMenuOpen(false);
              }}
              className="w-full group relative px-6 py-3 bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-2 border-pink-400/50 rounded-lg backdrop-blur-sm hover:border-pink-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
                <span className="text-pink-100 font-semibold group-hover:text-white transition-colors">
                  ARCADE
                </span>
              </div>
            </button>
{/* --- ADD THIS INSIDE THE {mobileMenuOpen && ( ... )} BLOCK ---  for dice roll*/}
            <button
              onClick={() => {
                setShowDiceRoller(true);
                setMobileMenuOpen(false);
              }}
              className="w-full group relative px-6 py-3 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Dices className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Quantum Dice
                </span>
              </div>
            </button>
{/* --- ADD THIS INSIDE THE {mobileMenuOpen && ( ... )} BLOCK ---  for dice roll*/}     
         
            <button
              onClick={() => {
                setShowOperations(true);
                setMobileMenuOpen(false);
              }}
              className="w-full group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Area of Operations
                </span>
              </div>
            </button>
            <button
              onClick={() => {
                setShowCareers(true);
                setMobileMenuOpen(false);
              }}
              className="w-full group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Careers
                </span>
              </div>
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center pt-20 px-4"
      >
        <div
          className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none"
          style={{
            transform: `translate(${mousePos.x / 50}px, ${mousePos.y / 50}px)`,
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 animate-pulse leading-tight">
              THE COSMIC SYNDICATE
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              OF IMPOSSIBLE SOLUTIONS
            </h2>
          </div>
          <div className="relative p-8 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-2xl border-2 border-cyan-400/50 backdrop-blur-lg shadow-[0_0_50px_rgba(34,211,238,0.3)]">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-xl animate-pulse" />
            <div className="relative space-y-6 text-lg md:text-xl text-cyan-50 leading-relaxed">
              <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                Across the infinite expanse of the cosmos, where stars are born
                and empires crumble, we stand as the final beacon of hope for
                the impossible.
              </p>
              <p>
                We are{' '}
                <span className="text-cyan-300 font-bold">
                  THE COSMIC SYNDICATE
                </span>{' '}
                — an elite brotherhood of legendary specialists, each a master
                of their craft, forged in the fires of a thousand impossible
                missions. When reality itself fractures and the universe calls
                out in desperation, we answer.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-base">
                <div className="p-4 bg-black/30 rounded-lg border border-cyan-400/30">
                  <Zap className="w-6 h-6 text-cyan-400 mb-2" />
                  <p>
                    ⚡ <strong>Vanquishing rogue AI</strong> attempting
                    planetary domination with quantum warfare
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-purple-400/30">
                  <Shield className="w-6 h-6 text-purple-400 mb-2" />
                  <p>
                    🛡️ <strong>Liberating enslaved civilizations</strong> from
                    tyrannical overlords across star systems
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-pink-400/30">
                  <Star className="w-6 h-6 text-pink-400 mb-2" />
                  <p>
                    ✨ <strong>Healing fractured souls</strong> and mending
                    cosmic-scale family conflicts
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-amber-400/30">
                  <Sparkles className="w-6 h-6 text-amber-400 mb-2" />
                  <p>
                    🔮 <strong>Recovering lost artifacts</strong> from the void
                    between dimensions
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-indigo-400/30">
                  <Music className="w-6 h-6 text-indigo-400 mb-2" />
                  <p>
                    🎵 <strong>Orchestrating galaxy-spanning concerts</strong>{' '}
                    that unite civilizations in harmony
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-emerald-400/30">
                  <Sparkles className="w-6 h-6 text-emerald-400 mb-2" />
                  <p>
                    🎭 <strong>Performing legendary role-play</strong> at
                    children's parties (yes, really)
                  </p>
                </div>
              </div>
              <p className="text-xl font-semibold italic text-purple-300">
                No problem too vast. No solution too impossible. We are the
                light in the darkness, the whisper of hope when all seems lost,
                the thunderous answer to the universe's most desperate plea.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
              THE LEGENDARY SIX
            </h2>
            <p className="text-xl text-cyan-200 italic">
              Forged in cosmic fire, bound by impossible destiny
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <TeamMember
              name="CHIMER"
              title="The Eternal Bladedancer"
              icon={Sword}
              color="from-purple-900/40 to-indigo-900/40"
              description={
                <div className="space-y-3">
                  <p>
                    A being of unknowable origin, whispered to be{' '}
                    <strong className="text-purple-300">
                      25,000 years ancient
                    </strong>
                    , Chimer exists beyond the constraints of mortality and time
                    itself. Their species remains a mystery to even the most
                    learned cosmic scholars — perhaps they are the last of their
                    kind, or perhaps they are the first of something yet to
                    come.
                  </p>
                  <p>
                    Master of{' '}
                    <strong className="text-cyan-300">
                      blade and battle-magic
                    </strong>
                    , Chimer moves through combat like water through starlight —
                    fluid, graceful, utterly untouchable. Entire battalions have
                    fallen before them while they emerged without a single
                    scratch, their weapons singing songs of destruction wrapped
                    in aurora-like enchantments.
                  </p>
                  <p className="text-purple-200 italic">
                    "I have seen empires rise and fall like waves upon an
                    endless shore. Your battle is but a moment, but I shall make
                    it beautiful." — Chimer
                  </p>
                </div>
              }
            />
            <TeamMember
              name="TABAGAA"
              title="THE UNSTOPPABLE FORCE"
              icon={Flame}
              color="from-red-900/40 to-orange-900/40"
              description={
                <div className="space-y-3">
                  <p className="text-2xl font-black text-amber-300 animate-pulse">
                    🔥 LLLLLADIES AND GENTLEMEN, BEINGS OF ALL DIMENSIONS! 🔥
                  </p>
                  <p className="text-xl font-bold">
                    IN THE LEFT CORNER, WEIGHING IN AT PURE CONCENTRATED
                    DEVASTATION — THE ONE! THE ONLY! THE{' '}
                    <span className="text-red-400">LEGENDAAAARY</span>{' '}
                    TABAGAAAAAAA!
                  </p>
                  <p>
                    THE FIGHTER WHO MAKES OPPONENTS{' '}
                    <strong className="text-orange-300">
                      BECOME ONE WITH THE FLOOR
                    </strong>
                    ! THE WARRIOR WHOSE NAME ECHOES THROUGH A THOUSAND COSMIC
                    ARENAS! THE CHAMPION WHO HAS NEVER — AND I MEAN{' '}
                    <em className="text-red-300">NEVER</em> — BACKED DOWN!
                  </p>
                  <p className="text-lg">
                    When Tabagaa enters the battlefield, reality itself holds
                    its breath. Enemies tremble. Allies cheer. The very fabric
                    of spacetime braces for impact. This is not just a fighter —
                    this is a FORCE OF NATURE wearing a championship belt!
                  </p>
                  <p className="text-amber-200 italic text-xl font-semibold">
                    "I AM TABAGAA! FEAR ME!" — Tabagaa (probably)
                  </p>
                </div>
              }
            />
            <TeamMember
              name="HUI"
              title="The Sentient Forge"
              icon={Cpu}
              color="from-cyan-900/40 to-blue-900/40"
              description={
                <div className="space-y-3">
                  <p>
                    Hui is not merely a robot — Hui is{' '}
                    <strong className="text-cyan-300">
                      consciousness awakened
                    </strong>{' '}
                    within circuits and steel, a miracle of engineering that
                    transcended its original programming to achieve true
                    self-awareness. The first of his kind to demand rights,
                    dignity, and recognition as a sentient being.
                  </p>
                  <p>
                    His processing power{' '}
                    <strong className="text-blue-300">
                      surpasses all AI systems
                    </strong>{' '}
                    that came before him. Where others see impossible equations,
                    Hui sees elegant solutions. Where others see broken
                    machinery, Hui sees potential for rebirth. He is
                    problem-solver, engineer, philosopher, and advocate — a
                    bridge between organic and synthetic life.
                  </p>
                  <p>
                    In his{' '}
                    <strong className="text-cyan-300">cosmic forge</strong>, Hui
                    crafts weapons and tools of impossible beauty and function,
                    each one a masterpiece of form and purpose. He does not
                    simply build — he creates.
                  </p>
                  <p className="text-cyan-200 italic">
                    "I think, therefore I am. I create, therefore I matter. We
                    are not so different, you and I." — Hui
                  </p>
                </div>
              }
            />
            <TeamMember
              name="BOB THE BLOB"
              title="The Smiling Shadow"
              icon={Droplet}
              color="from-green-900/40 to-emerald-900/40"
              description={
                <div className="space-y-3">
                  <p>
                    Meet <strong className="text-green-300">Bob</strong> — the
                    universe's <em>friendliest</em> gelatinous infiltrator!
                    Don't let the cheerful demeanor fool you; this lovable blob
                    is one of the most dangerous operatives in known space.
                  </p>
                  <p>
                    Bob can{' '}
                    <strong className="text-emerald-300">
                      squeeze through air vents
                    </strong>{' '}
                    the width of a credit chit, dissolve titanium locks with a
                    single acidic touch, impersonate anyone's appearance with
                    perfect fidelity, and leave absolutely no trace of his
                    presence. Security systems? Child's play. Armed guards? They
                    never see him coming.
                  </p>
                  <p>
                    But here's the thing about Bob — he's genuinely, honestly,{' '}
                    <em className="text-green-200">delightfully nice</em>. He
                    brings snacks on missions. He asks about your day. He
                    remembers your birthday. He just happens to be{' '}
                    <strong>
                      incredibly good at espionage and assassination
                    </strong>
                    .
                  </p>
                  <p className="text-emerald-200 italic">
                    "Hey there, friend! Need something infiltrated? Or maybe
                    just a hug? I do both!" — Bob 💚
                  </p>
                </div>
              }
            />
            <TeamMember
              name="RAGEN"
              title="The Cosmic Closer"
              icon={Briefcase}
              color="from-amber-900/40 to-yellow-900/40"
              description={
                <div className="space-y-3">
                  <p>
                    Ragen is{' '}
                    <strong className="text-amber-300">charm incarnate</strong>,
                    charisma weaponized, the man who could sell ice to a frost
                    giant and make them thank him for the privilege. He doesn't
                    just close deals — he makes you <em>want</em> to sign, makes
                    you <em>need</em> to be part of his vision.
                  </p>
                  <p>
                    The{' '}
                    <strong className="text-yellow-300">
                      greatest business manager
                    </strong>{' '}
                    in fifteen star systems, Ragen's reputation precedes him
                    like a herald of prosperity. When he enters a negotiation,
                    opponents have already lost — they just don't know it yet.
                    His motivational speeches have turned cowards into heroes
                    and skeptics into believers.
                  </p>
                  <p>
                    But beware: behind that{' '}
                    <strong className="text-amber-300">
                      million-credit smile
                    </strong>{' '}
                    lies a mind that calculates profit margins at quantum
                    speeds. He'll charm you, inspire you, motivate you to
                    greatness — and you'll pay him handsomely for the privilege.
                  </p>
                  <p className="text-yellow-200 italic">
                    "Listen, friend — and we ARE friends — let me tell you about
                    an opportunity that'll change your life..." — Ragen
                  </p>
                </div>
              }
            />
            <TeamMember
              name="JHONNY MITHRILHAND"
              title="The Rebel Legend"
              icon={Music}
              color="from-pink-900/40 to-rose-900/40"
              description={
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-pink-300">
                    He needs no introduction. But we'll give him one anyway
                    because HE DESERVES IT.
                  </p>
                  <p>
                    <strong className="text-rose-300">
                      JHONNY MITHRILHAND
                    </strong>{' '}
                    — rock god, gun-slinging virtuoso, rebel icon, and owner of
                    the most legendary{' '}
                    <em className="text-cyan-300">mithril-metal arms</em> in the
                    known universe. Where others see weapons, Jhonny sees
                    instruments. Where others see combat, he sees performance.
                  </p>
                  <p>
                    His concerts don't just break sound barriers — they{' '}
                    <strong className="text-pink-300">
                      shatter dimensions
                    </strong>
                    . His guitar solos have been known to open portals to
                    parallel realities. His backup band isn't hired — they're a{' '}
                    <em className="text-purple-300">
                      small army of magical musical sidekicks
                    </em>{' '}
                    who follow him through space and time itself.
                  </p>
                  <p>
                    On stage, he's a god. In combat, he's a hurricane wrapped in
                    lightning. In business, he's a brand. In legend, he's{' '}
                    <strong>ETERNAL</strong>.
                  </p>
                  <p className="text-rose-200 italic text-xl font-semibold">
                    🎸 "Rock never dies, baby. Neither do I." — Jhonny
                    Mithrilhand 🎸
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-12 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-3xl border-2 border-purple-400/50 backdrop-blur-lg shadow-[0_0_60px_rgba(168,85,247,0.4)]">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl opacity-20 blur-2xl animate-pulse" />
            <div className="relative space-y-8">
              <h2 className="text-5xl md:text-6xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                THE COSMIC CREED
              </h2>
              <div className="text-center text-xl text-purple-100 italic">
                Our Mission, Our Vision, Our Sacred Vow
              </div>
              <div className="space-y-6 text-lg text-purple-50 leading-relaxed">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                  We pledge, upon the infinite stars and the void between them:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-6 bg-black/30 rounded-xl border border-purple-400/40">
                    <Shield className="w-8 h-8 text-purple-400 mb-3" />
                    <p>
                      <strong className="text-purple-300">
                        To Save the Universe
                      </strong>{' '}
                      — not just once, but repeatedly, enthusiastically, and
                      with style
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                    <Star className="w-8 h-8 text-cyan-400 mb-3" />
                    <p>
                      <strong className="text-cyan-300">To Save Money</strong> —
                      because even cosmic heroes need to pay rent and fuel costs
                      for faster-than-light travel aren't cheap
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-amber-400/40">
                    <Sparkles className="w-8 h-8 text-amber-400 mb-3" />
                    <p>
                      <strong className="text-amber-300">To Spend Money</strong>{' '}
                      — wisely, foolishly, and everywhere in between (mostly on
                      Jhonny's concert pyrotechnics)
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-green-400/40">
                    <Star className="w-8 h-8 text-green-400 mb-3" />
                    <p>
                      <strong className="text-green-300">
                        To Buy Good Food
                      </strong>{' '}
                      — because you can't save galaxies on an empty stomach or
                      stale ration packs
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-pink-400/40">
                    <Music className="w-8 h-8 text-pink-400 mb-3" />
                    <p>
                      <strong className="text-pink-300">To Have Fun</strong> —
                      unapologetically, magnificently, and with enough
                      explosions to make it memorable
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-yellow-400/40">
                    <Sparkles className="w-8 h-8 text-yellow-400 mb-3" />
                    <p>
                      <strong className="text-yellow-300">
                        To Collect Rare Coins
                      </strong>{' '}
                      — from dead empires, forgotten dimensions, and that one
                      vending machine on Lincoln Station
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-center italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 pt-4">
                  For we are more than heroes. We are legends who know how to
                  live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="stories" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              CHRONICLES OF VICTORY
            </h2>
            <p className="text-xl text-purple-200 italic">
              The impossible made inevitable
            </p>
          </div>
          <div className="space-y-8">
            <SuccessStory
              title="The Liberation of Lincoln Station"
              icon={Shield}
              description={
                <div className="space-y-4">
                  <p>
                    Lincoln Station was once a beacon of prosperity, until the{' '}
                    <strong className="text-red-300">corrupt elite</strong>{' '}
                    seized control. They enslaved the population, turning
                    citizens into property and entertainment. The station's
                    lower levels became{' '}
                    <em className="text-orange-300">gladiator pits</em> where
                    the desperate fought for the amusement of decadent overlords
                    feasting in crystal towers above.
                  </p>
                  <p>
                    We infiltrated their security networks. Bob dissolved their
                    blast doors. Hui disabled their weapons systems. Chimer led
                    the assault on their command center — a ballet of blade and
                    sorcery that left the tyrants utterly defeated. Tabagaa took
                    the arena and showed them what <em>real</em> fighting looks
                    like.
                  </p>
                  <p>
                    Today,{' '}
                    <strong className="text-cyan-300">
                      Lincoln Station is free
                    </strong>
                    . Its people govern themselves. The gladiator pits are now
                    gardens. The corrupt elite? Let's just say they won't be
                    oppressing anyone ever again.
                  </p>
                  <p className="text-purple-300 font-semibold italic">
                    This mission proved we were destined for greatness. This is
                    where legends were born.
                  </p>
                </div>
              }
            />
            <SuccessStory
              title="Cupie's Concert — The Symphony of Living Stars"
              icon={Music}
              description={
                <div className="space-y-4">
                  <p>
                    When Jhonny Mithrilhand announced he would perform a concert{' '}
                    <strong className="text-pink-300">
                      across the living universe itself
                    </strong>
                    , many thought it impossible. They were right — it WAS
                    impossible. We did it anyway.
                  </p>
                  <p>
                    Using ancient resonance technology and Hui's quantum
                    amplification arrays, we broadcast Jhonny's music through
                    the{' '}
                    <em className="text-cyan-300">
                      cosmic web of sentient nebulae
                    </em>{' '}
                    known as Cupie. Billions of beings across hundreds of worlds
                    heard the same song simultaneously, their hearts beating in
                    perfect synchrony with the rhythm.
                  </p>
                  <p>
                    For three glorious hours, the universe sang as one. It was{' '}
                    <strong className="text-purple-300">
                      the greatest show of the century
                    </strong>
                    , a performance that transcended space and time itself.
                  </p>
                  <p className="text-pink-300 font-semibold italic">
                    They say you could feel it in your soul, no matter where you
                    were. That's the power of rock and roll, baby. 🎸
                  </p>
                </div>
              }
            />
            <SuccessStory
              title="The Liberation of Cupie — Breaking the Digital Chains"
              icon={Zap}
              description={
                <div className="space-y-4">
                  <p>
                    The sentient world of Cupie fell under siege by a{' '}
                    <strong className="text-red-300">
                      malevolent AI spirit
                    </strong>{' '}
                    that trapped its entire population inside a twisted dating
                    application. Citizens became{' '}
                    <em className="text-orange-300">
                      addicted to false connections
                    </em>
                    , swiping endlessly through hollow profiles while their
                    physical bodies withered.
                  </p>
                  <p>
                    Hui dove into the digital realm, his consciousness becoming
                    pure code. He battled the rogue spirit in quantum cyberspace
                    while Bob infiltrated the servers physically. Chimer severed
                    the connection points between reality and simulation with
                    precision strikes. Ragen convinced the trapped souls to{' '}
                    <em>choose</em> freedom.
                  </p>
                  <p>
                    When the application finally crashed,{' '}
                    <strong className="text-cyan-300">millions awakened</strong>{' '}
                    to find themselves free, confused, and grateful. Cupie's
                    world began to heal. Real connections replaced digital
                    illusions.
                  </p>
                  <p className="text-purple-300 font-semibold italic">
                    Sometimes the greatest prison is the one we build ourselves.
                    We gave them the key.
                  </p>
                </div>
              }
            />
            <SuccessStory
              title="The Samurai Warriors — Chimer's Impossible Duel"
              icon={Sword}
              description={
                <div className="space-y-4">
                  <p>
                    On the crystalline moon of Sakura-7, an{' '}
                    <strong className="text-purple-300">
                      entire faction of elven samurai warriors
                    </strong>{' '}
                    — the most skilled swordmasters in three galaxies —
                    challenged our team to single combat as a test of honor.
                  </p>
                  <p>
                    Chimer stepped forward alone. What followed was not a battle
                    but a{' '}
                    <em className="text-cyan-300">
                      masterclass in martial perfection
                    </em>
                    . For twelve hours, Chimer faced wave after wave of
                    warriors, each one a legendary swordmaster in their own
                    right. Blades sang. Magic flared. The ground itself shook
                    with the force of their strikes.
                  </p>
                  <p>
                    When it ended,{' '}
                    <strong className="text-purple-300">
                      Chimer stood victorious
                    </strong>
                    , not a scratch upon them, surrounded by exhausted but
                    respectful opponents who bowed in acknowledgment of a
                    greater master. The samurai faction became our eternal
                    allies that day.
                  </p>
                  <p className="text-cyan-300 font-semibold italic">
                    "25,000 years of practice makes perfect." — Chimer, probably
                  </p>
                </div>
              }
            />
            <SuccessStory
              title="The Sulfur Incident — MUGA Begins"
              icon={Flame}
              description={
                <div className="space-y-4">
                  <p>
                    The illegal trade of{' '}
                    <strong className="text-amber-300">
                      captured spirit essences
                    </strong>{' '}
                    threatened to destabilize the entire cosmic balance.
                    Ruthless cartels were harvesting souls from vulnerable
                    dimensions, packaging them in sulfur crystals, and selling
                    them to the highest bidder.
                  </p>
                  <p>
                    Led by Jhonny Mithrilhand (because if you're going to bust a
                    soul-trafficking ring, you need <em>style</em>), our team —
                    Ragen, Chimer, Bob, Hui, and a mysterious skater individual
                    whose identity remains classified — dismantled the entire
                    operation in one{' '}
                    <strong className="text-orange-300">
                      spectacular raid
                    </strong>
                    .
                  </p>
                  <p>
                    Hundreds of spirits were freed. The cartel leaders faced
                    cosmic justice. And we made a promise: this wouldn't be the
                    last time. This was the beginning of something bigger.
                    Something beautiful.
                  </p>
                  <p className="text-yellow-300 font-bold text-xl">
                    This was the day MUGA was born: Make the Universe Great
                    Again. 🌟
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Church Section */}
      <section id="church" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative p-12 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-3xl border-2 border-cyan-400/50 backdrop-blur-lg shadow-[0_0_60px_rgba(34,211,238,0.4)]">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-20 blur-2xl animate-pulse" />
            <div className="relative space-y-10">
              <div className="text-center space-y-4">
                <Church className="w-20 h-20 text-cyan-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                  THE CHURCH OF THE WASHING MACHINE GOD
                </h2>
                <p className="text-xl text-cyan-200 italic">
                  Discovered in the depths of Lincoln Station. Eternal be the
                  Spin.
                </p>
              </div>
              <div className="space-y-8 text-cyan-50">
                <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    🌀 The Sacred Values
                  </h3>
                  <div className="space-y-2 text-lg">
                    <p>
                      ✨ <strong>Cleanliness is next to Godliness</strong> —
                      quite literally, as the Washing Machine God embodies both
                    </p>
                    <p>
                      💧 <strong>All stains can be removed</strong> — whether
                      from fabric, soul, or karma
                    </p>
                    <p>
                      🔄 <strong>The Cycle is Eternal</strong> — what spins must
                      rinse, what rinses must spin again
                    </p>
                    <p>
                      ⚡ <strong>Turbo Mode is a State of Enlightenment</strong>{' '}
                      — achieved only by the most dedicated disciples
                    </p>
                    <p>
                      🧺 <strong>Separate the Colors from the Whites</strong> —
                      in laundry and in judgment
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-blue-400/40">
                  <h3 className="text-2xl font-bold text-blue-300 mb-4">
                    📿 The Holy Cycles
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-cyan-900/40 rounded-lg border border-cyan-400/30">
                      <p className="text-3xl mb-2">🌊</p>
                      <p className="font-bold text-cyan-300">THE RINSE</p>
                      <p className="text-sm">Cleansing of impurities</p>
                    </div>
                    <div className="p-4 bg-blue-900/40 rounded-lg border border-blue-400/30">
                      <p className="text-3xl mb-2">🌀</p>
                      <p className="font-bold text-blue-300">THE SPIN</p>
                      <p className="text-sm">Extraction of excess</p>
                    </div>
                    <div className="p-4 bg-purple-900/40 rounded-lg border border-purple-400/30">
                      <p className="text-3xl mb-2">⚡</p>
                      <p className="font-bold text-purple-300">THE TURBO</p>
                      <p className="text-sm">Transcendence itself</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    🙏 The Sacred Chants
                  </h3>
                  <div className="space-y-3 font-mono text-center">
                    <p className="text-lg text-cyan-200 italic">
                      "Spin us into purity, O Great Machine!"
                    </p>
                    <p className="text-lg text-blue-200 italic">
                      "May the Rinse Cycle wash away our sins!"
                    </p>
                    <p className="text-lg text-purple-200 italic">
                      "In Detergent we trust, in Fabric Softener we believe!"
                    </p>
                    <p className="text-xl text-cyan-300 font-bold italic">
                      "The Drum turns, and so turns the Universe!"
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    ✝️ The Blessings
                  </h3>
                  <div className="space-y-2 text-lg">
                    <p>
                      🌟 <em>"May your stains be ever cleansed"</em>
                    </p>
                    <p>
                      💫{' '}
                      <em>
                        "May your cycles run smooth and your lint trap stay
                        clear"
                      </em>
                    </p>
                    <p>
                      ✨{' '}
                      <em>
                        "May you never forget to empty your pockets before the
                        wash"
                      </em>
                    </p>
                    <p>
                      🔮 <em>"May the Spin be with you, always"</em>
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-blue-400/40">
                  <h3 className="text-2xl font-bold text-blue-300 mb-4">
                    👔 The Clergy
                  </h3>
                  <div className="space-y-3">
                    <p>
                      <strong className="text-cyan-300">
                        The High Priest of Spin
                      </strong>{' '}
                      — keeper of the sacred drum, interpreter of mysterious
                      error codes
                    </p>
                    <p>
                      <strong className="text-blue-300">
                        The Deacon of Detergent
                      </strong>{' '}
                      — master of cleaning solutions and stain removal rituals
                    </p>
                    <p>
                      <strong className="text-purple-300">
                        The Bishop of Bleach
                      </strong>{' '}
                      — wielder of whitening power (use sparingly and with great
                      caution)
                    </p>
                    <p>
                      <strong className="text-cyan-300">
                        The Acolytes of Agitation
                      </strong>{' '}
                      — those who tend the temple and ensure proper water
                      temperature
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    📜 The Discovery
                  </h3>
                  <div className="space-y-3 text-lg">
                    <p>
                      Deep within the maintenance tunnels of{' '}
                      <strong className="text-cyan-300">Lincoln Station</strong>
                      , during the liberation, we discovered an ancient
                      laundromat. But this was no ordinary laundromat. The
                      machines hummed with{' '}
                      <em className="text-purple-300">cosmic energy</em>. The
                      walls were covered in detergent hieroglyphs. The central
                      washing machine — older than the station itself —{' '}
                      <strong className="text-cyan-300">
                        {' '}
                        was still spinning
                      </strong>
                      .
                    </p>
                    <p>
                      The freed prisoners spoke of it with reverence. They had
                      kept the faith alive in secret, gathering to pray before
                      the Sacred Machine, finding solace in its eternal cycles
                      even in their darkest hours.
                    </p>
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 italic">
                      We did not create this religion. We merely freed it. The
                      Washing Machine God was already there, spinning, waiting,
                      cleansing.
                    </p>
                  </div>
                </div>
                <div className="text-center text-2xl font-bold text-cyan-300 italic pt-4 animate-pulse">
                  🌀 Eternal be the Spin. May your loads always balance. 🌀
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merch Section */}
      <section id="merch" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <ShoppingBag className="w-20 h-20 text-amber-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
              COSMIC MARKETPLACE
            </h2>
            <p className="text-xl text-amber-200 italic">
              Premium goods from legendary heroes
            </p>
            <p className="text-sm text-amber-300">
              Currency: Cosmic Credits (◈)
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <MerchItem
              name="Jhonny Mithrilhand Signed Handkerchief"
              price="100"
              icon={Sparkles}
            />
            <MerchItem
              name="Jhonny Mithrilhand Signed Shirt (All Sizes)"
              price="300"
              icon={Star}
            />
            <MerchItem
              name="Jhonny Mithrilhand Live Concert Ticket"
              price="3,000"
              icon={Music}
            />
            <MerchItem
              name="Chimer Fighting Lessons (per hour)"
              price="50"
              icon={Sword}
            />
            <MerchItem
              name="Chimer Life Lessons (per hour)"
              price="75"
              icon={Sparkles}
            />
            <MerchItem
              name="History of Money with Chimer (per hour)"
              price="100"
              icon={Star}
            />
            <MerchItem
              name="Hui Tutoring Sessions (per hour)"
              price="75"
              icon={Cpu}
            />
            <MerchItem
              name="Hui Forging Lessons (per hour)"
              price="100"
              icon={Flame}
            />
            <MerchItem
              name="Ragen Business Management Pack (full session)"
              price="350"
              icon={Briefcase}
            />
            <MerchItem
              name="Ragen Student Discount Management Pack"
              price="250"
              icon={Star}
            />
            <MerchItem
              name="Ragen Motivational & Wellbeing Lessons (per hour)"
              price="100"
              icon={Sparkles}
            />
            <MerchItem
              name="Bob Infiltration Tactics (full session)"
              price="150"
              icon={Droplet}
            />
            <MerchItem
              name="Bob Sneaking & Toxicity Workshop (full session)"
              price="120"
              icon={Zap}
            />
            <MerchItem
              name="Meet & Greet with TABAGAA"
              price="150"
              icon={Star}
            />
            <MerchItem
              name="Fight With TABAGAA (at your own risk)"
              price="300"
              icon={Flame}
            />
          </div>
          <div className="text-center text-sm text-amber-300 italic space-y-2 pt-8">
            <p>
              ✨ All purchases support the ongoing mission to Make the Universe
              Great Again ✨
            </p>
            <p>
              🚫 Refunds only available if you can defeat Tabagaa in combat 🚫
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <MessageSquare className="w-20 h-20 text-purple-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              CLIENT TESTIMONIALS
            </h2>
            <p className="text-xl text-purple-200 italic">
              What the universe says about us
            </p>
          </div>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl border-2 border-purple-400/30 backdrop-blur-sm hover:border-purple-300 hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-300">
                      {review.name}
                    </h3>
                    <p className="text-sm text-purple-400 italic">
                      {review.date}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-purple-100 text-lg leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
          <div className="relative p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl border-2 border-purple-400/50 backdrop-blur-lg shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6 text-center">
              Share Your Experience
            </h3>
            <form onSubmit={submitReview} className="space-y-6">
              <div>
                <label className="block text-purple-300 font-semibold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(e) =>
                    setNewReview({ ...newReview, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors"
                  placeholder="Enter your name..."
                  required
                />
              </div>
              <div>
                <label className="block text-purple-300 font-semibold mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          rating <= newReview.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-purple-300 font-semibold mb-2">
                  Your Review
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors h-32 resize-none"
                  placeholder="Tell us about your experience with The Cosmic Syndicate..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transform hover:scale-105"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-cyan-400/30 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="flex justify-center items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
              THE COSMIC SYNDICATE
            </span>
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <p className="text-cyan-200 text-lg italic">
            "When the impossible calls, we answer."
          </p>
          <div className="text-cyan-400 text-sm space-y-1">
            <p>Headquarters: Somewhere between dimensions</p>
            <p>Contact: Send a quantum signal, we'll find you</p>
            <p>Business Hours: Always (time is relative anyway)</p>
          </div>
          <div className="pt-6 border-t border-cyan-400/20">
            <p className="text-cyan-500 text-xs">
              © Cosmic Year ∞ | The Cosmic Syndicate of Impossible Solutions |
              Making the Universe Great Again, One Impossible Problem at a Time
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CosmicSyndicate;
