import React, { useState, useEffect, useRef, useCallback } from 'react';
import DiceBox from '@3d-dice/dice-box';
import {
  // Core Icons
  Skull,
  Crosshair,
  Flame,
  Orbit,
  Book,
  Cpu,
  Scroll,
  Terminal,
  ChevronRight,
  ShieldAlert,
  Activity,
  X,
  Dices,
  AlertTriangle,
  Fingerprint,
  Radio,
  Eye,
  Target,
  Zap,
  Lock,
  BarChart3,
  Globe,
  Wifi,
  Sword,
  Radiation,
  Biohazard,
  Sparkles,
  Bug,
  ShieldCheck,
  Heart,
  Brain,
  Volume2,
  VolumeX,
  ChevronDown,
  RotateCw,
  Gauge,
  AlertOctagon,
  Check,
  AlertCircle,
  HelpCircle,
  Trophy,
  Search,
  Swords,
  Trophy as TrophyIcon,
} from 'lucide-react';

// --- ANIMATION SYSTEM ---
const Anima = {
  entry: (targets, delay = 0) => {
    if (!window.anime) return;
    return window.anime({
      targets,
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.95, 1],
      duration: 600,
      delay,
      easing: 'easeOutCubic',
    });
  },

  combat: (targets, intensity = 1) => {
    if (!window.anime) return;
    return window.anime({
      targets,
      keyframes: [
        { translateX: -3 * intensity, rotateZ: -2 * intensity },
        { translateX: 3 * intensity, rotateZ: 2 * intensity },
        { translateX: -3 * intensity, rotateZ: -2 * intensity },
        { translateX: 0, rotateZ: 0 },
      ],
      duration: 300,
      easing: 'easeInOutQuad',
    });
  },

  exterminatus: (onComplete) => {
    if (!window.anime) return;
    return window.anime.timeline({
      easing: 'easeOutExpo',
      complete: onComplete,
    });
  },

  corruption: (targets, intensity) => {
    if (!window.anime) return;
    return window.anime({
      targets,
      filter: `hue-rotate(${intensity * 3.6}deg) brightness(${
        1 + intensity / 200
      })`,
      duration: 2000,
      easing: 'easeInOutQuad',
    });
  },

  weaponFire: (targets) => {
    if (!window.anime) return;
    return window.anime({
      targets,
      keyframes: [
        { scale: 1, opacity: 1, boxShadow: '0 0 0 rgba(255,0,0,0)' },
        { scale: 1.2, opacity: 0.8, boxShadow: '0 0 20px rgba(255,0,0,0.8)' },
        { scale: 1, opacity: 1, boxShadow: '0 0 0 rgba(255,0,0,0)' },
      ],
      duration: 200,
      easing: 'easeOutQuad',
    });
  },

  pulse: (targets) => {
    if (!window.anime) return;
    return window.anime({
      targets,
      scale: [1, 1.05, 1],
      duration: 1000,
      loop: true,
      easing: 'easeInOutQuad',
    });
  },

  shake: (targets, intensity = 5) => {
    if (!window.anime) return;
    return window.anime({
      targets,
      translateX: [
        { value: -intensity, duration: 50 },
        { value: intensity, duration: 50 },
        { value: -intensity, duration: 50 },
        { value: 0, duration: 50 },
      ],
      loop: 3,
    });
  },

  notify: (message, type = 'info') => {
    if (!window.anime) return;
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[300] px-4 py-2 font-tech text-xs border ${
      type === 'success'
        ? 'border-green-500 text-green-400 bg-black/95'
        : type === 'error'
        ? 'border-red-500 text-red-400 bg-black/95'
        : type === 'warning'
        ? 'border-yellow-500 text-yellow-400 bg-black/95'
        : 'border-[#c5a059] text-[#c5a059] bg-black/95'
    } shadow-[0_0_20px_rgba(0,0,0,0.8)] max-w-xs transform translate-x-full opacity-0`;
    toast.textContent = message;
    document.body.appendChild(toast);

    window
      .anime({
        targets: toast,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutCubic',
      })
      .finished.then(() => {
        setTimeout(() => {
          window.anime({
            targets: toast,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            complete: () => toast.remove(),
          });
        }, 3000);
      });
  },
};

// --- GLOBAL STYLES ---
const ImperialGlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@400;600;700&display=swap');
    
    :root {
      --void-black: #050505;
      --gold-trim: #c5a059;
      --gold-bright: #e5c079;
      --rusted-iron: #5a2e2e;
      --tactical-green: #00ff41;
      --alert-red: #ff3333;
      --mechanicus-red: #801010;
      --warp-purple: #8b00ff;
      --sororitas-red: #d40000;
      --admin-blue: #1e3a8a;
      --psyker-blue: #00ffff;
      --heretic-purple: #7c00ff;
      --pure-white: #ffffff;
      --text-gray: #a0a0a0;
    }

    /* CLEAN READABLE FONTS */
    .font-gothic { font-family: 'Cinzel', serif; letter-spacing: 0.05em; }
    .font-tech { font-family: 'Share Tech Mono', monospace; }
    .font-ui { font-family: 'Inter', sans-serif; font-weight: 600; }
    .font-body { font-family: 'Inter', sans-serif; font-weight: 400; }

    /* CRT EFFECTS */
    .scanlines {
      background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
      background-size: 100% 4px;
      position: fixed; pointer-events: none; inset: 0; z-index: 40;
    }
    
    .crt-flicker { animation: flicker 0.15s infinite; }
    @keyframes flicker {
      0% { opacity: 0.98; } 5% { opacity: 0.95; } 10% { opacity: 0.9; } 
      15% { opacity: 0.95; } 20% { opacity: 1; } 50% { opacity: 0.95; } 100% { opacity: 0.99; }
    }

    /* WARP CORRUPTION */
    .warp-corruption {
      filter: hue-rotate(280deg) brightness(0.8) saturate(200%);
      transition: filter 2s ease;
    }

    /* IMPROVED SCROLLBAR */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--void-black); border: 1px solid var(--rusted-iron); }
    ::-webkit-scrollbar-thumb { background: var(--gold-trim); border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--gold-bright); }

    /* PLANETARY ROTATION */
    @keyframes rotate-planet { 
      from { background-position: 0 0; } 
      to { background-position: 200% 0; } 
    }
    .planet-texture { 
      background-image: url('https://www.transparenttextures.com/patterns/black-scales.png'); 
      animation: rotate-planet 20s linear infinite;
    }

    /* BLOOD SPLATTER */
    .blood-splatter {
      background-image: url('https://www.transparenttextures.com/patterns/red-blood.png');
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    .blood-active { opacity: 0.35; }

    /* PURITY SEAL */
    .purity-seal {
      position: absolute;
      top: -8px;
      right: -8px;
      transform: rotate(45deg);
      font-family: 'Share Tech Mono';
      font-size: 8px;
      color: var(--alert-red);
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      pointer-events: none;
    }

    /* BUTTON ENHANCEMENTS */
    .btn-interactive {
      transition: all 0.15s ease;
      transform-origin: center;
    }
    .btn-interactive:hover {
      box-shadow: 0 0 15px rgba(197,160,89,0.4);
      transform: translateY(-2px);
    }
    .btn-interactive:active {
      transform: translateY(0) scale(0.98);
    }
    .btn-interactive:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `}</style>
);

// --- TEXT SCRAMBLE COMPONENT ---
const DecryptText = ({ text, className, chaosLevel = 0 }) => {
  const [display, setDisplay] = useState(text);
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789ABCDEF';
  const corruptedChars = 'W̴̢̮̖͉̦̞̋͒͛̇Ä̵̼̜̫͉̭́̓̈́̑́R̸͉͋͋͝P̸̛̰̟̖͓̓̔̒̑̈́ ̴͍̐͐̓Ṫ̸̳̘̹̫̉̃̾̉̄Ą̶͉̬̯̬͒̍̕͝Ị̵̛̈́̋͛͝Ņ̸̛̗̰̲̲̙̈́̈͘T̶̛̻̘̰̦̮̒͗͒S̵̤̟̦̥̪̱̓̅͝';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              if (chaosLevel > 70 && Math.random() > 0.7) {
                return corruptedChars[
                  Math.floor(Math.random() * corruptedChars.length)
                ];
              }
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30 + chaosLevel * 0.5);
    return () => clearInterval(interval);
  }, [text, chaosLevel]);

  return (
    <span className={`${className} ${chaosLevel > 80 ? 'chaos-glitch' : ''}`}>
      {display}
    </span>
  );
};

// --- TACTICAL AUSPEX COMPONENT ---
const TacticalAuspex = ({ onClose, chaosLevel }) => {
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [notation, setNotation] = useState('1d20');
  const diceBoxRef = useRef(null);
  const [diceLog, setDiceLog] = useState([]);

  useEffect(() => {
    if (window.anime) {
      window.anime({
        targets: '.auspex-container',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutExpo',
      });
    }

    const initBox = async () => {
      try {
        const box = new DiceBox('#auspex-canvas', {
          id: '#dice-box',
          assetPath: 'assets/',
          origin: 'https://unpkg.com/@3d-dice/dice-box@1.1.4/dist/',
          theme: 'default',
          themeColor: '#800000',
          scale: 25,
        });
        diceBoxRef.current = box;
        await box.init();
      } catch (e) {
        console.error(e);
      }
    };
    initBox();
  }, []);

  const rollDice = async (customNotation = null) => {
    if (!diceBoxRef.current || rolling) return;
    const rollNotation = customNotation || notation;
    setRolling(true);
    setResult(null);
    diceBoxRef.current.clear();

    if (window.anime) {
      window.anime({
        targets: '#auspex-canvas',
        translateX: [
          { value: -5, duration: 50 },
          { value: 5, duration: 50 },
          { value: 0, duration: 50 },
        ],
        loop: 2,
      });
    }

    try {
      const res = await diceBoxRef.current.roll(rollNotation);
      let total = Array.isArray(res)
        ? res.reduce((acc, r) => acc + r.value, 0)
        : res.value;

      const rollEntry = {
        notation: rollNotation,
        result: total,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        critical: total >= 20,
      };
      setDiceLog((prev) => [rollEntry, ...prev.slice(0, 4)]);

      setTimeout(() => {
        setResult({ total, details: res });
        setRolling(false);
        if (total >= 20 && window.anime) {
          Anima.weaponFire('#auspex-canvas');
        }
      }, 1000);
    } catch (e) {
      setRolling(false);
      setResult({ total: 'ERROR', details: e.message });
    }
  };

  const presetRolls = [
    { label: 'ASSAULT', notation: '3d6+4' },
    { label: 'PENETRATION', notation: '1d100' },
    { label: 'CRITICAL', notation: '1d20' },
    { label: 'MORTAL', notation: '4d10' },
    { label: 'PERILS', notation: '2d20' },
    { label: 'EXTERMINATE', notation: '6d6' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center font-tech p-4 backdrop-blur-sm">
      <div className="auspex-container relative w-full max-w-5xl h-[80vh] bg-zinc-900 border-4 border-[#c5a059] flex flex-col shadow-[0_0_50px_rgba(197,160,89,0.3)] opacity-0">
        <div className="bg-red-950 p-3 flex justify-between items-center border-b-4 border-[#c5a059]">
          <h3 className="text-[#c5a059] font-gothic font-bold text-xl tracking-widest flex items-center gap-2">
            <Dices /> TACTICAL AUSPEX v2.41
          </h3>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform"
          >
            <X className="text-red-500 hover:text-white w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 bg-black relative overflow-hidden">
          <div id="auspex-canvas" className="absolute inset-0 z-10"></div>

          {result !== null && !rolling && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <div
                className={`bg-black/90 border-2 p-8 text-center ${
                  result.critical ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div
                  className={`text-8xl font-bold font-mono drop-shadow-[0_0_15px_rgba(51,255,0,0.8)] ${
                    result.critical ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {result.total}
                </div>
                {result.critical && (
                  <div className="text-green-500 font-tech text-sm mt-2 animate-pulse">
                    CRITICAL HIT
                  </div>
                )}
              </div>
            </div>
          )}

          {rolling && (
            <div className="absolute top-4 left-4 z-20 text-yellow-500 font-tech text-sm flex items-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin" /> CALCULATING
              EMPEROR'S WILL
            </div>
          )}
        </div>

        <div className="bg-zinc-950 p-2 border-t border-[#333]">
          <div className="font-tech text-[10px] text-zinc-500 mb-1">
            RECENT ROLLS:
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {diceLog.map((log, i) => (
              <div
                key={i}
                className={`px-2 py-1 bg-[#222] border text-[9px] whitespace-nowrap ${
                  log.critical
                    ? 'border-green-500 text-green-400'
                    : 'border-[#444] text-zinc-400'
                }`}
              >
                {log.notation} = {log.result}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border-t-4 border-[#c5a059]">
          <div className="grid grid-cols-6 gap-2 mb-4">
            {presetRolls.map((p, i) => (
              <button
                key={i}
                onClick={() => rollDice(p.notation)}
                disabled={rolling}
                className="px-3 py-2 bg-[#111] border border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-black font-bold uppercase transition-all text-[10px] whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={notation}
              onChange={(e) => setNotation(e.target.value)}
              className="flex-1 bg-black border border-[#333] text-green-500 px-3 py-2 font-tech text-sm"
              placeholder="e.g., 2d10+5"
            />
            <button
              onClick={() => rollDice()}
              disabled={rolling}
              className="px-6 py-2 bg-red-900 border border-red-500 text-red-300 font-bold uppercase hover:bg-red-700 transition-all"
            >
              <Dices className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ENHANCED WEAPON SYSTEM ---
const WeaponSelector = ({ selectedWeapon, onSelectWeapon, chaosLevel }) => {
  const [weapons, setWeapons] = useState([
    {
      name: 'BOLT PISTOL',
      dmg: '2d6+3',
      range: '24"',
      type: 'pistol',
      icon: Crosshair,
      color: 'text-red-500',
      ammo: 12,
      maxAmmo: 12,
      cooldown: 0,
      maxCooldown: 0,
    },
    {
      name: 'CHAINSWORD',
      dmg: '1d10+5',
      range: 'Melee',
      type: 'melee',
      icon: Sword,
      color: 'text-[#c5a059]',
      ammo: Infinity,
      maxAmmo: Infinity,
      cooldown: 0,
      maxCooldown: 0,
    },
    {
      name: 'PLASMA GUN',
      dmg: '3d8',
      range: '36"',
      type: 'rapid',
      icon: Zap,
      color: 'text-cyan-400',
      ammo: 3,
      maxAmmo: 3,
      cooldown: 1,
      maxCooldown: 3,
    },
    {
      name: 'FLAMER',
      dmg: '2d10',
      range: 'Template',
      type: 'template',
      icon: Flame,
      color: 'text-orange-400',
      ammo: 6,
      maxAmmo: 6,
      cooldown: 2,
      maxCooldown: 4,
    },
    {
      name: 'MELTA',
      dmg: '4d10',
      range: '12"',
      type: 'melta',
      icon: Radioactive,
      color: 'text-yellow-400',
      ammo: 2,
      maxAmmo: 2,
      cooldown: 3,
      maxCooldown: 5,
    },
    {
      name: 'PSYKER STAFF',
      dmg: '2d8+WP',
      range: '48"',
      type: 'psyker',
      icon: Sparkles,
      color: 'text-purple-400',
      ammo: 5,
      maxAmmo: 5,
      cooldown: 0,
      maxCooldown: 0,
    },
  ]);

  const fireWeapon = (weapon, index) => {
    if (weapon.ammo <= 0 || weapon.cooldown > 0) {
      Anima.notify('WEAPON NOT READY', 'warning');
      return;
    }

    Anima.weaponFire(`.weapon-${index}`);
    onSelectWeapon(weapon);

    const updated = [...weapons];
    updated[index].ammo--;
    if (updated[index].ammo < 0) updated[index].ammo = 0;
    updated[index].cooldown = updated[index].maxCooldown;
    setWeapons(updated);

    Anima.notify(`${weapon.name} ENGAGED`, 'success');
  };

  useEffect(() => {
    const cooldownTimer = setInterval(() => {
      setWeapons((prev) =>
        prev.map((w) => ({
          ...w,
          cooldown: Math.max(0, w.cooldown - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(cooldownTimer);
  }, []);

  return (
    <div className="bg-[#111] border-2 border-[#333] p-4">
      <h3 className="font-gothic font-bold text-[#c5a059] mb-4 flex items-center gap-2">
        <Swords className="w-4 h-4" /> ARSENAL
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {weapons.map((w, i) => {
          const Icon = w.icon;
          const isSelected = selectedWeapon?.name === w.name;
          const isReady = w.ammo > 0 && w.cooldown === 0;

          return (
            <div
              key={i}
              onClick={() => fireWeapon(w, i)}
              className={`weapon-card weapon-${i} relative p-3 border cursor-pointer transition-all active:scale-95 ${
                isSelected
                  ? 'border-[#c5a059] bg-[#c5a059]/20'
                  : isReady
                  ? 'border-[#555] hover:border-[#c5a059] hover:bg-[#222]'
                  : 'border-[#333] bg-[#1a1a1a] opacity-60'
              } ${
                chaosLevel > 60 && Math.random() > 0.7 ? 'warp-corruption' : ''
              }`}
              title={`${w.name} - AMMO: ${w.ammo}/${w.maxAmmo}${
                w.cooldown > 0 ? ` - COOLDOWN: ${w.cooldown}s` : ''
              }`}
            >
              <Icon
                className={`w-5 h-5 ${w.color} mb-1 ${
                  !isReady ? 'animate-pulse' : ''
                }`}
              />
              <div className="font-tech text-[9px] text-zinc-300">{w.name}</div>
              <div className="font-tech text-[8px] text-green-500">{w.dmg}</div>

              {w.ammo !== Infinity && (
                <div
                  className={`absolute top-1 right-1 w-4 h-4 rounded-full text-[7px] flex items-center justify-center ${
                    w.ammo > 0
                      ? 'bg-green-600 text-black'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {w.ammo}
                </div>
              )}

              {w.cooldown > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#333]">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${(w.cooldown / (w.maxCooldown || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              )}

              {isSelected && (
                <div className="absolute inset-0 border-2 border-green-500 animate-pulse pointer-events-none"></div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          setWeapons((prev) =>
            prev.map((w) => ({
              ...w,
              ammo: w.maxAmmo,
            }))
          );
          Anima.notify('ARSENAL RELOADED', 'success');
          Anima.shake('.weapon-card', 3);
        }}
        className="w-full mt-3 py-2 bg-[#222] border border-[#555] text-zinc-400 hover:text-[#c5a059] hover:border-[#c5a059] font-tech text-[10px] transition-all btn-interactive"
      >
        <RotateCw className="w-3 h-3 inline mr-1" /> RELOAD ALL
      </button>
    </div>
  );
};

// --- ENHANCED ENEMY SYSTEM ---
const EnemyTacticalDisplay = ({ enemies, onEngage, chaosLevel, onPurge }) => {
  const [scannedEnemy, setScannedEnemy] = useState(null);

  const enemyTypes = [
    {
      name: 'CULTIST',
      hp: 10,
      threat: 1,
      icon: Bug,
      color: 'text-orange-400',
      weakTo: 'FLAMER',
      type: 'mortal',
    },
    {
      name: 'CHAOS MARINE',
      hp: 25,
      threat: 3,
      icon: Skull,
      color: 'text-red-500',
      weakTo: 'MELTA',
      type: 'heretic',
    },
    {
      name: 'DAEMONETTE',
      hp: 20,
      threat: 2,
      icon: Heart,
      color: 'text-pink-400',
      weakTo: 'PSYKER STAFF',
      type: 'daemonic',
    },
    {
      name: 'PLAGUEBEARER',
      hp: 30,
      threat: 2,
      icon: Radioactive,
      color: 'text-green-400',
      weakTo: 'PLASMA GUN',
      type: 'daemonic',
    },
    {
      name: 'RUBRIC MARINE',
      hp: 35,
      threat: 4,
      icon: ShieldAlert,
      color: 'text-purple-400',
      weakTo: 'BOLT PISTOL',
      type: 'heretic',
    },
    {
      name: 'WARP SPAWN',
      hp: 50,
      threat: 5,
      icon: Biohazard,
      color: 'text-purple-500',
      weakTo: 'EXTERMINATUS',
      type: 'warp',
    },
  ];

  const spawnEnemy = () => {
    const enemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const newEnemy = {
      ...enemy,
      id: Date.now(),
      currentHp: enemy.hp,
      priority: Math.random() > 0.7,
    };
    onEngage([...enemies, newEnemy]);
    Anima.notify(`THREAT DETECTED: ${enemy.name}`, 'warning');
    Anima.combat('.enemy-target');
  };

  const scanEnemy = (enemy) => {
    setScannedEnemy(enemy);
    Anima.notify(`SCANNING: ${enemy.name} - WEAK TO ${enemy.weakTo}`, 'info');
  };

  const purgeEnemy = (enemyId) => {
    const enemy = enemies.find((e) => e.id === enemyId);
    if (!enemy) return;

    Anima.notify(`PURGING: ${enemy.name}`, 'success');
    Anima.weaponFire('.enemy-target');

    setTimeout(() => {
      onEngage((prev) => prev.filter((e) => e.id !== enemyId));
      onPurge(enemy);
    }, 500);
  };

  return (
    <div className="bg-[#111] border-2 border-[#5a2e2e] p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-gothic font-bold text-[#c5a059] flex items-center gap-2">
          <Target className="w-4 h-4" /> THREAT MATRIX
        </h3>
        <button
          onClick={spawnEnemy}
          className="px-2 py-1 bg-red-900 border border-red-500 text-red-200 font-tech text-[9px] hover:bg-red-700 transition-all btn-interactive flex items-center gap-1"
        >
          <Bug className="w-3 h-3" /> SPAWN
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
        {enemies.length === 0 ? (
          <div className="text-[10px] text-zinc-500 font-tech text-center py-4">
            NO THREATS DETECTED
          </div>
        ) : (
          enemies.map((e) => {
            const Icon = e.icon;
            const isScanned = scannedEnemy?.id === e.id;
            return (
              <div
                key={e.id}
                className={`enemy-target flex items-center justify-between p-2 bg-[#222] border hover:border-[#c5a059] transition-all ${
                  e.priority ? 'border-red-500' : 'border-[#333]'
                } ${isScanned ? 'bg-red-900/20' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-4 h-4 ${e.color} ${
                      e.priority ? 'animate-pulse' : ''
                    }`}
                  />
                  <div>
                    <div className="font-tech text-[11px]">{e.name}</div>
                    <div className="font-tech text-[9px] text-zinc-500">
                      THREAT: {e.threat}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="font-tech text-[10px] text-red-500">
                    {e.currentHp}/{e.hp}
                  </div>
                  <div
                    className={`w-14 bg-[#333] h-1 border border-[#444] relative`}
                  >
                    <div
                      className="h-full bg-red-600 transition-all"
                      style={{ width: `${(e.currentHp / e.hp) * 100}%` }}
                    ></div>
                    {e.currentHp < e.hp * 0.3 && (
                      <div className="absolute inset-0 bg-red-400 animate-pulse opacity-50"></div>
                    )}
                  </div>

                  <button
                    onClick={() => purgeEnemy(e.id)}
                    className="p-1 bg-red-900 border border-red-500 text-red-200 font-tech text-[8px] hover:bg-red-700 transition-all btn-interactive"
                    title="PURGE"
                  >
                    <Flame className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-[#333] font-tech text-[9px] text-zinc-500">
        <div className="flex items-center gap-1 mb-1">
          <Search className="w-3 h-3" /> Right-click to scan
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3" /> Click 🔥 to purge
        </div>
      </div>
    </div>
  );
};

// --- MACHINE SPIRIT CONSOLE ---
const MachineSpiritConsole = ({ satisfaction, setSatisfaction }) => {
  const [praying, setPraying] = useState(false);
  const [favor, setFavor] = useState(0);

  const appeaseMachineSpirit = () => {
    if (praying) return;
    setPraying(true);

    if (window.anime) {
      window.anime({
        targets: '.prayer-target',
        scale: [1, 1.05],
        opacity: [0.5, 1],
        duration: 2000,
        easing: 'easeInOutQuad',
        complete: () => {
          const gain = Math.floor(Math.random() * 15) + 20;
          setSatisfaction(Math.min(100, satisfaction + gain));
          setFavor((prev) => prev + 1);
          setPraying(false);
          Anima.notify(`MACHINE SPIRIT APPEASED +${gain}%`, 'success');
        },
      });
    }
  };

  return (
    <div className="prayer-target bg-[#111] border-2 border-[#333] p-4 relative">
      <div className="absolute top-2 right-2">
        <Cpu className="w-5 h-5 text-[#c5a059]" />
      </div>
      <h3 className="font-gothic font-bold text-[#c5a059] mb-2 flex items-center gap-2">
        <Activity className="w-4 h-4" /> MACHINE SPIRIT
      </h3>
      <div className="font-tech text-[11px] text-zinc-400 mb-3">
        Satisfaction: {satisfaction}%{' '}
        {favor > 0 && <span className="text-green-400">(+{favor} favor)</span>}
      </div>
      <div className="w-full bg-[#222] h-2 border border-[#333] mb-3">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
          style={{ width: `${satisfaction}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={appeaseMachineSpirit}
          disabled={praying || satisfaction >= 95}
          className={`py-2 font-tech text-[10px] border transition-all ${
            praying
              ? 'border-green-500 text-green-500 animate-pulse'
              : 'border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-black'
          } disabled:opacity-50`}
        >
          {praying ? (
            'PRAYING...'
          ) : (
            <>
              <Sparkles className="w-3 h-3 inline mr-1" /> RECITE CANTICLE
            </>
          )}
        </button>
      </div>

      {satisfaction < 30 && (
        <div className="mt-2 font-tech text-[9px] text-red-500 animate-pulse flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> WARNING: SPIRIT UNQUIET
        </div>
      )}
    </div>
  );
};

// --- CHAOS METER ---
const ChaosMeter = ({ level, setLevel }) => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (window.anime) {
      Anima.corruption('.chaos-container', level);
    }
  }, [level]);

  const cleanse = () => {
    const reduction = Math.min(25, 10 + streak * 2);
    setLevel((prev) => Math.max(0, prev - reduction));
    setStreak((prev) => prev + 1);
    Anima.notify(`CORRUPTION REDUCED -${reduction}%`, 'success');
    Anima.combat('.chaos-container', 2);
  };

  return (
    <div className="chaos-container bg-[#111] border-2 border-[#333] p-4 relative overflow-hidden">
      <div className="absolute top-2 right-2">
        <Biohazard className="w-5 h-5 text-purple-500" />
      </div>
      <h3 className="font-gothic font-bold text-red-500 mb-2 flex items-center gap-2">
        <Brain className="w-4 h-4" /> CORRUPTION LEVEL
      </h3>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 bg-[#222] h-4 border border-[#333] relative">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
            style={{ width: `${level}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center font-tech text-[10px] text-white">
            {level}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={cleanse}
          className="py-1 bg-green-900 border border-green-500 text-green-200 font-tech text-[9px] hover:bg-green-700 transition-all btn-interactive flex items-center justify-center gap-1"
        >
          <Sparkles className="w-3 h-3" /> CLEANSE{' '}
          {streak > 0 && `(${streak}x)`}
        </button>
      </div>

      {level > 80 && (
        <div className="mt-2 font-tech text-[10px] text-purple-400 animate-pulse flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> WARNING: WARP SIGNATURES
          DETECTED
        </div>
      )}
    </div>
  );
};

// --- ENHANCED PLANET VISUALIZER ---
const PlanetVisualizer = ({ damage = 0, onOrbitalStrike }) => {
  const [orbitalStrikes, setOrbitalStrikes] = useState([]);
  const [scanning, setScanning] = useState(false);

  const addOrbitalStrike = () => {
    const newStrike = {
      id: Date.now(),
      x: Math.random() * 100,
      y: Math.random() * 100,
    };
    setOrbitalStrikes((prev) => [...prev, newStrike]);
    onOrbitalStrike && onOrbitalStrike();

    setTimeout(() => {
      setOrbitalStrikes((prev) => prev.filter((s) => s.id !== newStrike.id));
    }, 2000);
  };

  const scanPlanet = () => {
    setScanning(true);
    Anima.notify('SCANNING FOR HERETICAL LIFESIGNS...', 'info');
    setTimeout(() => {
      setScanning(false);
      const heretics = Math.floor(Math.random() * 1000) + 500;
      Anima.notify(`DETECTED ${heretics} HERETICAL LIFEFORMS`, 'warning');
    }, 1500);
  };

  useEffect(() => {
    if (window.anime) {
      window.anime({
        targets: '.planet-container',
        scale: [0, 1],
        rotate: [0, 360],
        duration: 3000,
        easing: 'easeOutElastic',
      });
    }
  }, []);

  return (
    <div className="relative w-full h-64 border border-[#5a2e2e] bg-black overflow-hidden flex items-center justify-center group">
      <div className="planet-container absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        <div className="w-40 h-40 rounded-full bg-[#1a0a0a] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.8),0_0_20px_rgba(197,160,89,0.2)] relative overflow-hidden border border-[#c5a059]/30">
          <div className="absolute inset-0 planet-texture opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent"></div>

          {damage > 0 && (
            <div
              className="absolute inset-0 bg-red-900/20"
              style={{ opacity: damage / 100 }}
            ></div>
          )}

          {orbitalStrikes.map((strike) => (
            <div
              key={strike.id}
              className="absolute w-8 h-8 bg-red-500 rounded-full animate-ping"
              style={{ left: `${strike.x}%`, top: `${strike.y}%` }}
            ></div>
          ))}
        </div>

        <div className="absolute w-56 h-56 rounded-full border border-dashed border-[#c5a059]/30 animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute w-72 h-72 rounded-full border border-dotted border-red-900/40 animate-[spin_20s_linear_infinite_reverse]"></div>

        <div className="absolute top-4 left-4 text-[10px] font-tech text-red-500">
          COORD: 44.21.99
          <br />
          STATUS: {damage > 50 ? 'CRITICAL' : 'HERESY DETECTED'}
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={addOrbitalStrike}
            className="p-2 bg-red-900/70 border border-red-500 text-red-200 font-tech text-[10px] hover:bg-red-900 transition-all btn-interactive"
            title="Orbital Strike"
          >
            <Orbit className="w-4 h-4" />
          </button>
          <button
            onClick={scanPlanet}
            disabled={scanning}
            className="p-2 bg-blue-900/70 border border-blue-500 text-blue-200 font-tech text-[10px] hover:bg-blue-900 transition-all btn-interactive disabled:opacity-50"
            title={scanning ? 'SCANNING...' : 'Scan Planet'}
          >
            {scanning ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const InquisitionDashboard = ({ onNavigate }) => {
  const [mode, setMode] = useState('STANDARD');
  const [tab, setTab] = useState('SQUAD');
  const [showDice, setShowDice] = useState(false);
  const [exterminatus, setExterminatus] = useState(false);
  const [logs, setLogs] = useState([]);
  const [combatLogs, setCombatLogs] = useState([]);
  const [animeReady, setAnimeReady] = useState(false);
  const [audioContext, setAudioContext] = useState(null);

  const [chaosLevel, setChaosLevel] = useState(15);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [satisfaction, setSatisfaction] = useState(75);
  const [planetaryDamage, setPlanetaryDamage] = useState(0);
  const [audioMuted, setAudioMuted] = useState(false);
  const [exterminatusCountdown, setExterminatusCountdown] = useState(10);
  const [favor, setFavor] = useState(5);

  const containerRef = useRef(null);
  const exterminatusInterval = useRef(null);

  // Audio System
  useEffect(() => {
    if (!audioMuted) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      
      // Create ambient hum
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(50, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.005, ctx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      
      return () => {
        oscillator.stop();
        ctx.close();
      };
    }
  }, [audioMuted]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
    script.async = true;
    script.onload = () => {
      setAnimeReady(true);
      const timeline = window.anime.timeline({
        easing: 'cubicBezier(.5, .05, .1, .3)',
      });

      timeline
        .add({
          targets: '.main-interface',
          scaleY: [0.01, 1],
          opacity: [0, 1],
          duration: 800,
        })
        .add(
          { targets: '.scanlines', opacity: [0, 1], duration: 1000 },
          '-=400'
        )
        .add(
          {
            targets: '.boot-sequence',
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 600,
          },
          '-=200'
        )
        .finished.then(() => {
          addLog('NOOSPHERE SYNCHRONIZED...');
          Anima.notify('INQUISITORIAL CLEARANCE VERIFIED', 'success');
        });
    };
    document.body.appendChild(script);

    const handleKeyPress = (e) => {
      if (e.key === '1') setTab('SQUAD');
      if (e.key === '2') setTab('MISSION');
      if (e.key === '3') setTab('ARSENAL');
      if (e.key === '4') setTab('THREATS');
      if (e.key === ' ') {
        e.preventDefault();
        if (!exterminatus) handleExterminatus();
      }
      if (e.key === 'r' || e.key === 'R') {
        setSelectedWeapon(null);
        Anima.notify('WEAPONS RESET', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    const chaosTimer = setInterval(() => {
      setChaosLevel((prev) => Math.min(100, prev + Math.random() * 2));
    }, 5000);

    const eventTimer = setInterval(() => {
      const events = [
        { msg: 'Warp fluctuation detected...', level: 10, type: 'warning' },
        { msg: 'Purity seal verified...', level: -5, type: 'success' },
        {
          msg: 'Heretical transmission intercepted...',
          level: 15,
          type: 'warning',
        },
        { msg: 'Machine spirit appeased...', level: -8, type: 'success' },
        { msg: 'Daemonic incursion in sector 7...', level: 20, type: 'error' },
        { msg: 'Blood for the Blood God...', level: 25, type: 'error' },
      ];
      const event = events[Math.floor(Math.random() * events.length)];
      addCombatLog(event.msg);
      setChaosLevel((prev) => Math.max(0, Math.min(100, prev + event.level)));
      // REMOVED: Anima.notify(event.msg, event.type);
    }, 15000);

    return () => {
      clearInterval(chaosTimer);
      clearInterval(eventTimer);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (animeReady && window.anime) {
      Anima.entry('.tab-content', 100);
    }
  }, [tab, animeReady]);

  const handleExterminatus = () => {
    if (exterminatus || !animeReady || favor < 3) {
      if (favor < 3)
        Anima.notify('REQUIRES 3 FAVOR TO INVOKE EXTERMINATUS', 'error');
      return;
    }

    setExterminatus(true);
    setExterminatusCountdown(10);
    setFavor((prev) => prev - 3);
    addLog('!!! EXTERMINATUS AUTHORIZATION SIGMA-OMEGA-DELTA !!!');
    Anima.notify('EXTERMINATUS PROTOCOL ENGAGED', 'error');

    let count = 10;
    exterminatusInterval.current = setInterval(() => {
      setExterminatusCountdown(count);
      count--;
      if (count < 0) {
        clearInterval(exterminatusInterval.current);
      }
    }, 1000);

    const timeline = Anima.exterminatus(() => {
      addLog("TARGET PURGED. THE EMPEROR'S WILL BE DONE.");
      setExterminatus(false);
      setPlanetaryDamage(100);
      setChaosLevel(0);
      setEnemies([]);
      setFavor((prev) => prev + 10);
      document.body.style.filter = 'none';
      Anima.notify('PLANET PURGED - FAVOR OF THE EMPEROR +10', 'success');
    });

    timeline
      .add({
        targets: 'body',
        filter: [
          'brightness(1) hue-rotate(0deg)',
          'brightness(0.3) hue-rotate(-60deg) saturate(200%)',
        ],
        duration: 500,
      })
      .add(
        {
          targets: '.main-interface',
          translateX: () => window.anime.random(-15, 15),
          translateY: () => window.anime.random(-15, 15),
          duration: 3000,
          easing: 'linear',
          direction: 'alternate',
          loop: true,
        },
        '-=500'
      )
      .add(
        { targets: '.exterminatus-overlay', opacity: [0, 1], duration: 100 },
        '-=3000'
      )
      .add(
        {
          targets: '.countdown-digit',
          scale: [0, 1],
          opacity: [0, 1],
          duration: 500,
          color: ['#c5a059', '#ff0000'],
        },
        '-=2900'
      )
      .add(
        { targets: '.blood-splatter', opacity: [0, 0.4], duration: 2000 },
        '-=2500'
      );
  };

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const imperialDate = `${Math.floor(Math.random() * 9) + 1}.${Math.floor(
      Math.random() * 999
    )}.${Math.floor(Math.random() * 999)}.M3`;
    setLogs((prev) => [
      ...prev.slice(-5),
      `[${timestamp}] [${imperialDate}] > ${msg}`,
    ]);
  };

  const addCombatLog = (msg) => {
    setCombatLogs((prev) => [...prev.slice(-3), `» ${msg.toUpperCase()}`]);
  };

  const handlePurge = (enemy) => {
    setFavor((prev) => prev + enemy.threat);
    setPlanetaryDamage((prev) => Math.min(100, prev + enemy.threat * 5));
    Anima.notify(`PURGED ${enemy.name} +${enemy.threat} FAVOR`, 'success');
  };

  const showShortcuts = () => {
    Anima.notify(
      'SHORTCUTS: [1,2,3,4]=Tabs [SPACE]=Exterminatus [R]=Reset',
      'info'
    );
  };

  const retinue = [
    {
      name: 'MAGOS KQ-234',
      role: 'Magos Biologis',
      faction: 'Mechanicus',
      status: 'OPERATIONAL',
      icon: Cpu,
      desc: 'The flesh is weak. I have replaced my doubt with circuitry.',
      hp: 85,
      sanity: 45,
      factionColor: 'text-cyan-400',
    },
    {
      name: 'LOGIS DEX-POINTER',
      role: 'Strategos',
      faction: 'Administratum',
      status: 'CALCULATING',
      icon: Scroll,
      desc: 'I have filed form 27-B. Your heresy has been noted in triplicate.',
      hp: 65,
      sanity: 85,
      factionColor: 'text-blue-400',
    },
    {
      name: 'NEIL, SANCTIONED',
      role: 'Psyker',
      faction: 'Telepathica',
      status: 'UNSTABLE',
      icon: Activity,
      desc: 'The voices in the Warp are very loud. They say you forgot your password.',
      hp: 45,
      sanity: 25,
      factionColor: 'text-purple-400',
    },
    {
      name: 'SISTER XENA',
      role: 'Sister Superior',
      faction: 'Sororitas',
      status: 'BLESSED',
      icon: Flame,
      desc: 'Burn the heretic! Kill the mutant! Purge the unclean!',
      hp: 90,
      sanity: 95,
      factionColor: 'text-rose-400',
    },
    {
      name: 'CONFESSOR MICKEY',
      role: 'Ministorum',
      faction: 'Ecclesiarchy',
      status: 'ZEALOUS',
      icon: Book,
      desc: 'My chainsword is the only argument I need.',
      hp: 80,
      sanity: 60,
      factionColor: 'text-amber-400',
    },
    {
      name: 'VINDICARE KAIROS',
      role: 'Assassin',
      faction: 'Assassinorum',
      status: 'REDACTED',
      icon: Crosshair,
      desc: '...',
      hp: 70,
      sanity: 50,
      factionColor: 'text-zinc-400',
    },
  ];

  return (
    <div
      className={`min-h-screen bg-[#050505] text-[#c5a059] relative overflow-x-hidden selection:bg-red-900 selection:text-white ${
        mode === 'AUSPEX' ? 'auspex-mode' : ''
      } ${chaosLevel > 70 ? 'warp-corruption' : ''}`}
    >
      <ImperialGlobalStyles />

      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_100%)]"></div>
      {mode === 'AUSPEX' && (
        <div className="fixed inset-0 z-30 pointer-events-none bg-green-500/10 mix-blend-overlay"></div>
      )}
      <div
        className={`scanlines ${chaosLevel > 80 ? 'chaos-glitch' : ''}`}
      ></div>

      <div
        className={`blood-splatter fixed inset-0 z-25 pointer-events-none ${
          exterminatus ? 'blood-active' : ''
        }`}
      ></div>

      <div className="boot-sequence fixed top-4 left-4 z-50 font-tech text-[10px] text-green-500 opacity-0 flex items-center gap-2">
        <Cpu className="w-3 h-3 animate-spin" />
        <span>BOOTING CEREBRUM IMPERIALIS...</span>
      </div>

      {exterminatus && (
        <div className="exterminatus-overlay fixed inset-0 z-[200] bg-red-900/50 flex items-center justify-center pointer-events-none opacity-0">
          <div className="border-y-8 border-red-600 w-full bg-black/90 py-24 text-center backdrop-blur-sm">
            <div className="countdown-digit text-[12rem] font-black text-red-600 font-gothic leading-none mb-4">
              {exterminatusCountdown > 0 ? exterminatusCountdown : 'PURGE'}
            </div>
            <div className="text-4xl text-red-500 font-tech tracking-[1em] animate-pulse">
              {exterminatusCountdown > 0
                ? 'EXTERMINATUS IN PROGRESS'
                : "THE EMPEROR'S WRIT"}
            </div>
          </div>
        </div>
      )}

      {showDice && (
        <TacticalAuspex
          onClose={() => setShowDice(false)}
          chaosLevel={chaosLevel}
        />
      )}

      <header className="relative z-10 border-b-4 border-[#5a2e2e] bg-black/90 p-4 sticky top-0 shadow-2xl flex justify-between items-center main-interface crt-flicker">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#2a0f0f] border-2 border-[#5a2e2e] flex items-center justify-center relative overflow-hidden btn-interactive">
            <Skull className="w-10 h-10 text-[#c5a059]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_60%,_#c5a059_70%,_transparent_80%)] animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-gothic font-black tracking-widest leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#e5c079] to-[#8a6e3e] btn-interactive">
              <DecryptText text="ORDO XENOS" chaosLevel={chaosLevel} />
            </h1>
            <div className="flex gap-3 text-[10px] font-tech text-red-500 font-bold tracking-[0.2em] uppercase mt-2">
              <ShieldAlert className="w-3 h-3" /> SECTOR CALIXIS // CLEARANCE
              MAGENTA // GRADE: ULTRAVIOLET
            </div>
            <div className="font-tech text-[9px] text-zinc-500 mt-1">
              {new Date().toLocaleDateString()} - IMPERIAL DATE: 0
              {Math.floor(Math.random() * 9) + 1}.
              {Math.floor(Math.random() * 999)}.M3
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={showShortcuts}
            className="p-2 bg-[#111] border border-[#333] hover:border-[#c5a059] transition-all btn-interactive"
            title="Show Keyboard Shortcuts"
          >
            <HelpCircle className="w-5 h-5 text-zinc-400 hover:text-[#c5a059]" />
          </button>

          <button
            onClick={() => {
              setAudioMuted(!audioMuted);
              addLog(
                audioMuted ? 'VOX-CHANNELS UNMUTED' : 'VOX-CHANNELS MUTED'
              );
              Anima.notify(audioMuted ? 'SOUND ON' : 'SOUND OFF', 'info');
            }}
            className="p-2 bg-[#111] border border-[#333] hover:border-[#c5a059] transition-all btn-interactive"
          >
            {audioMuted ? (
              <VolumeX className="w-5 h-5 text-zinc-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#c5a059]" />
            )}
          </button>

          <button
            onClick={onNavigate}
            className="group px-6 py-2 bg-[#2a0f0f] border border-[#5a2e2e] hover:bg-red-900 hover:border-red-500 transition-all flex items-center gap-2 shadow-lg btn-interactive main-interface"
          >
            <div className="text-right hidden md:block">
              <div className="text-[10px] text-red-400 font-tech uppercase">
                System Override
              </div>
              <div className="font-gothic font-bold text-xs text-[#c5a059]">
                RETURN TO SYNDICATE
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main
        className="main-interface relative z-10 max-w-7xl mx-auto p-4 md:p-8 crt-flicker"
        ref={containerRef}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <button
            onClick={() => {
              const newMode = mode === 'STANDARD' ? 'AUSPEX' : 'STANDARD';
              setMode(newMode);
              addLog(
                `VISUAL MODE: ${
                  newMode === 'AUSPEX'
                    ? 'NIGHTSIGHT ACTIVATED'
                    : 'STANDARD VISION'
                }`
              );
              Anima.notify(
                newMode === 'AUSPEX' ? 'AUSPEX MODE ON' : 'AUSPEX MODE OFF',
                'info'
              );
            }}
            className={`p-3 border transition-all flex flex-col items-center justify-center gap-2 btn-interactive ${
              mode === 'AUSPEX'
                ? 'bg-green-900/20 border-green-500 text-green-500'
                : 'bg-[#111] border-[#c5a059] hover:bg-[#c5a059] hover:text-black'
            }`}
          >
            <Eye className="w-6 h-6" />
            <span className="font-gothic font-bold text-xs">
              {mode === 'AUSPEX' ? 'AUSPEX ON' : 'AUSPEX OFF'}
            </span>
          </button>

          <button
            onClick={() => {
              setShowDice(true);
              addLog('TACTICAL AUSPEX ENGAGING... MACHINE SPIRIT AWAKENING...');
              Anima.notify('DICE ROLLER ACTIVATED', 'info');
            }}
            className="p-3 bg-[#111] border border-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all flex flex-col items-center justify-center gap-2 btn-interactive"
          >
            <Dices className="w-6 h-6" />{' '}
            <span className="font-gothic font-bold text-xs">AUSPEX</span>
          </button>

          <button
            onClick={() => {
              setTab('SQUAD');
              addLog('ACCESSING SQUAD ROSTER: RETINUE OATHS VERIFIED');
              Anima.notify('RETINUE ROSTER LOADED', 'info');
            }}
            className={`p-3 border transition-all flex flex-col items-center justify-center gap-2 btn-interactive ${
              tab === 'SQUAD'
                ? 'bg-[#c5a059] text-black border-[#c5a059]'
                : 'bg-[#111] border-[#c5a059] text-[#c5a059]'
            }`}
          >
            <Fingerprint className="w-6 h-6" />{' '}
            <span className="font-gothic font-bold text-xs">RETINUE</span>
          </button>

          <button
            onClick={() => {
              setTab('MISSION');
              addLog('TACTICAL DISPLAY: PLANETARY ASSAULT PARAMETERS LOADED');
              Anima.notify('MISSION PARAMETERS LOADED', 'info');
            }}
            className={`p-3 border transition-all flex flex-col items-center justify-center gap-2 btn-interactive ${
              tab === 'MISSION'
                ? 'bg-[#c5a059] text-black border-[#c5a059]'
                : 'bg-[#111] border-[#c5a059] text-[#c5a059]'
            }`}
          >
            <Target className="w-6 h-6" />{' '}
            <span className="font-gothic font-bold text-xs">ASSAULT</span>
          </button>

          <button
            onClick={() => {
              setTab('ARSENAL');
              addLog('ARSENAL: WEAPON BLESSINGS VERIFIED BY TECH-PRIEST');
              Anima.notify('ARSENAL ONLINE', 'info');
            }}
            className={`p-3 border transition-all flex flex-col items-center justify-center gap-2 btn-interactive ${
              tab === 'ARSENAL'
                ? 'bg-[#c5a059] text-black border-[#c5a059]'
                : 'bg-[#111] border-[#c5a059] text-[#c5a059]'
            }`}
          >
            <Sword className="w-6 h-6" />{' '}
            <span className="font-gothic font-bold text-xs">ARSENAL</span>
          </button>

          <button
            onClick={() => {
              setTab('THREATS');
              addLog(
                'THREAT MATRIX: ANALYZING XENOS/HERETIC/DAEMONIC SIGNATURES'
              );
              Anima.notify('THREAT MATRIX ACTIVE', 'info');
            }}
            className={`p-3 border transition-all flex flex-col items-center justify-center gap-2 btn-interactive ${
              tab === 'THREATS'
                ? 'bg-[#c5a059] text-black border-[#c5a059]'
                : 'bg-[#111] border-[#c5a059] text-[#c5a059]'
            }`}
          >
            <Bug className="w-6 h-6" />{' '}
            <span className="font-gothic font-bold text-xs">THREATS</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* LEFT COLUMN: CONTENT */}
          <div className="lg:col-span-3 min-h-[600px]">
            {tab === 'SQUAD' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 tab-content">
                {retinue.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={i}
                      className="operative-card relative group bg-[#111] border-2 border-[#5a4a3a] hover:border-[#c5a059] hover:shadow-[0_0_20px_rgba(197,160,89,0.2)] transition-all p-6 cursor-pointer active:scale-[0.98] overflow-hidden btn-interactive"
                      onClick={() => {
                        Anima.combat(`.operative-card:nth-child(${i + 1})`);
                        addCombatLog(`${m.name} REPORTING IN`);
                        Anima.notify(`${m.name} STATUS: ${m.status}`, 'info');
                      }}
                    >
                      <div className="purity-seal">
                        {
                          [
                            'PURITY',
                            'FAITH',
                            'DUTY',
                            'HONOR',
                            'VIGILANCE',
                            'JUSTICE',
                          ][i]
                        }
                      </div>
                      <Icon className="absolute bottom-2 left-2 w-32 h-32 opacity-5 pointer-events-none" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            m.status === 'OPERATIONAL' || m.status === 'BLESSED'
                              ? 'bg-green-500'
                              : m.status === 'UNSTABLE'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          } animate-pulse`}
                        ></div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-xl font-gothic font-black text-[#c5a059] uppercase border-b border-[#333] pb-2 mb-2">
                          {m.name}
                        </h3>
                        <p
                          className={`text-xs ${m.factionColor} font-tech tracking-wider mb-3 flex items-center gap-1`}
                        >
                          <Icon className="w-3 h-3" />
                          {m.role}
                        </p>
                        <p className="font-gothic text-zinc-400 text-xs italic mb-4 h-12 overflow-hidden">
                          "{m.desc}"
                        </p>

                        <div className="space-y-2 font-tech text-[10px] mb-3">
                          <div className="flex justify-between text-green-600">
                            <span>VITALITY</span>
                            <span>{m.hp}%</span>
                          </div>
                          <div className="w-full bg-[#222] h-1 relative">
                            <div
                              className="h-full bg-green-600"
                              style={{ width: `${m.hp}%` }}
                            ></div>
                            <div
                              className="absolute top-0 left-0 h-full bg-green-400 animate-pulse"
                              style={{ width: `${m.hp}%`, opacity: 0.5 }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-[#c5a059]">
                            <span>SANCTITY</span>
                            <span>{m.sanity}%</span>
                          </div>
                          <div className="w-full bg-[#222] h-1 relative">
                            <div
                              className="h-full bg-[#c5a059]"
                              style={{ width: `${m.sanity}%` }}
                            ></div>
                            {m.sanity < 50 && (
                              <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              Anima.notify(`${m.name}: PRAYER SENT`, 'success');
                              Anima.pulse(
                                `.operative-card:nth-child(${i + 1})`
                              );
                              setSatisfaction((prev) =>
                                Math.min(100, prev + 2)
                              );
                            }}
                            className="px-2 py-1 bg-[#222] border border-[#444] text-zinc-400 hover:text-[#c5a059] hover:border-[#c5a059] font-tech text-[9px] transition-all btn-interactive"
                          >
                            <Sparkles className="w-2 h-2 inline mr-1" /> PRAY
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addLog(`${m.name} REPORTS: NO HERESY DETECTED`);
                              Anima.notify(`${m.name}: ALL CLEAR`, 'info');
                            }}
                            className="px-2 py-1 bg-[#222] border border-[#444] text-zinc-400 hover:text-green-500 hover:border-green-500 font-tech text-[9px] transition-all btn-interactive"
                          >
                            <Check className="w-2 h-2 inline mr-1" /> REPORT
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'MISSION' && (
              <div className="bg-[#111] border-2 border-[#5a4a3a] p-1 tab-content h-full">
                <div className="border border-[#c5a059]/30 p-6 h-full relative overflow-hidden flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-gothic font-bold text-[#c5a059]">
                      <DecryptText
                        text="PLANETARY ASSAULT: OPERATION FINAL JUDGEMENT"
                        chaosLevel={chaosLevel}
                      />
                    </h2>
                    <div className="text-right font-tech text-xs text-red-500">
                      <div className="mb-2">
                        THREAT LEVEL:{' '}
                        <span className="animate-pulse">EXTREMIS</span>
                      </div>
                      <div>
                        POPULATION: 4.2 BILLION{' '}
                        <span className="text-zinc-400">(EXPENDABLE)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 flex-1">
                    <PlanetVisualizer
                      damage={planetaryDamage}
                      onOrbitalStrike={() =>
                        setPlanetaryDamage((prev) => Math.min(100, prev + 5))
                      }
                    />
                    <div className="space-y-4 font-tech text-sm text-zinc-300">
                      <div className="p-4 bg-[#050505] border border-[#333] hover:border-[#c5a059] transition-all">
                        <div className="text-[#c5a059] font-bold mb-2 flex items-center gap-2">
                          <Wifi className="w-4 h-4 animate-pulse" /> INTERCEPTED
                          VOX-CAST
                        </div>
                        <p className="italic opacity-70">
                          "...they came from the skies... shadows with burning
                          eyes... Emperor save us..."
                        </p>
                        <p className="text-red-500 text-[10px] mt-2">
                          - Last transmission from Hive Secundus
                        </p>
                      </div>

                      <div className="p-4 bg-[#050505] border border-[#333] space-y-3">
                        <div className="font-bold text-[#c5a059] flex items-center gap-2">
                          <Globe className="w-4 h-4" /> TACTICAL OBJECTIVES
                        </div>
                        <div className="space-y-2 text-[11px]">
                          <div
                            className="flex items-center gap-2 hover:text-green-500 transition-all cursor-pointer"
                            onClick={() =>
                              setPlanetaryDamage(
                                Math.min(100, planetaryDamage + 10)
                              )
                            }
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>{' '}
                            LZ ALPHA SECURED
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>{' '}
                            HIVE CITY 7 - CONTESTED
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>{' '}
                            MANUFACTORUM - HERETIC CONTROL
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>{' '}
                            WARP ANOMALY - DAEMON PRESENCE
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#050505] border border-[#333]">
                        <div className="font-bold text-[#c5a059] text-[12px] mb-2 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> STRATEGIC ASSETS
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
                          <div className="hover:text-[#c5a059] transition-all">
                            • Thunderhawks: 3
                          </div>
                          <div className="hover:text-[#c5a059] transition-all">
                            • Leman Russ: 12
                          </div>
                          <div className="hover:text-[#c5a059] transition-all">
                            • Astartes: 1 Squad
                          </div>
                          <div className="hover:text-[#c5a059] transition-all">
                            • Orbitals: ONLINE
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-black/50 border border-[#333]">
                    <div className="flex justify-between items-center font-tech text-[10px] text-red-500 mb-1">
                      <span>PLANETARY DESTRUCTION LEVEL</span>
                      <span>{planetaryDamage}%</span>
                    </div>
                    <div className="w-full bg-[#222] h-2 border border-[#333]">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 transition-all"
                        style={{ width: `${planetaryDamage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'ARSENAL' && (
              <div className="grid md:grid-cols-2 gap-6 tab-content">
                <WeaponSelector
                  selectedWeapon={selectedWeapon}
                  onSelectWeapon={(w) => {
                    setSelectedWeapon(w);
                    addLog(`WEAPON SELECTED: ${w.name}`);
                  }}
                  chaosLevel={chaosLevel}
                />
                <div className="bg-[#111] border-2 border-[#5a4a3a] p-4">
                  <h3 className="font-gothic font-bold text-[#c5a059] mb-3 flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4" /> FAVOR
                  </h3>
                  <div className="font-tech text-[24px] text-center text-green-400">
                    {favor}
                  </div>
                  <div className="font-tech text-[9px] text-zinc-500 text-center mt-1">
                    Omnsissiah's Blessing
                  </div>
                </div>
              </div>
            )}

            {tab === 'THREATS' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 tab-content">
                <EnemyTacticalDisplay
                  enemies={enemies}
                  onEngage={setEnemies}
                  chaosLevel={chaosLevel}
                  onPurge={handlePurge}
                />
                <div className="space-y-4 lg:col-span-2">
                  <ChaosMeter level={chaosLevel} setLevel={setChaosLevel} />
                  <div className="bg-[#111] border-2 border-[#5a4a3a] p-4">
                    <h3 className="font-gothic font-bold text-[#c5a059] mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> IMMEDIATE THREATS
                    </h3>
                    <div className="space-y-2 text-[11px] font-tech">
                      <div className="flex items-center gap-2 text-orange-400 hover:bg-[#222] p-1 transition-all cursor-pointer">
                        <Bug className="w-3 h-3" /> Genestealer Cult Infestation
                      </div>
                      <div className="flex items-center gap-2 text-red-500 hover:bg-[#222] p-1 transition-all cursor-pointer">
                        <Flame className="w-3 h-3" /> Chaos Space Marine Warband
                      </div>
                      <div className="flex items-center gap-2 text-purple-500 hover:bg-[#222] p-1 transition-all cursor-pointer">
                        <Brain className="w-3 h-3" /> Warp Rift Manifestation
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#111] border-2 border-red-900 p-4">
                    <h3 className="font-gothic font-bold text-red-500 mb-3">
                      <AlertOctagon className="w-4 h-4 inline mr-2" /> PRIMARY
                      TARGET
                    </h3>
                    <div className="font-tech text-[12px] text-red-400 space-y-1">
                      <div className="font-gothic text-sm">
                        DEMON PRINCE KOR'LAETH
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Location: Hive Primus Cathedral
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 px-2 py-1 bg-red-900 border border-red-500 text-red-200 text-[9px] hover:bg-red-700 transition-all btn-interactive flex items-center justify-center gap-1">
                          <Sword className="w-3 h-3" /> ENGAGE
                        </button>
                        <button className="px-2 py-1 bg-[#111] border border-[#333] text-zinc-400 text-[9px] hover:border-[#c5a059] transition-all btn-interactive">
                          <Search className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111] border-2 border-[#5a2e2e] p-4 font-tech text-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-gothic font-bold text-[#c5a059] flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> SYSTEM STATUS
                </h3>
                <div
                  className={`w-3 h-3 rounded-full ${
                    satisfaction > 50 ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}
                ></div>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center">
                  <span>NOOSPHERE</span>
                  <span className="text-green-500 flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    CONNECTED
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VOX-CASTER</span>
                  <span className="text-green-500">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>GELLAR FIELD</span>
                  <span className="text-yellow-500">FLUCTUATING</span>
                </div>
                <div className="flex justify-between">
                  <span>SPIRIT MACHINE</span>
                  <span
                    className={
                      satisfaction > 50 ? 'text-green-500' : 'text-red-500'
                    }
                  >
                    {satisfaction > 50 ? 'APPEASED' : 'UNQUIET'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>WARP DRIVE</span>
                  <span
                    className={
                      chaosLevel > 80
                        ? 'text-red-500 animate-pulse'
                        : 'text-yellow-500'
                    }
                  >
                    {chaosLevel > 80 ? 'OVERLOAD' : 'STANDBY'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-black border-2 border-[#333] p-4 font-tech text-xs text-green-500 h-64 overflow-hidden relative shadow-inner">
              <div className="absolute top-2 right-2 text-green-800 opacity-50">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div className="absolute top-2 left-2 font-tech text-[10px] text-green-700">
                COMBAT LOG v2.41
              </div>
              <div className="space-y-1 mt-6">
                {combatLogs.map((log, i) => (
                  <div
                    key={i}
                    className="opacity-90 hover:opacity-100 transition-all hover:text-green-400"
                  >
                    {log}
                  </div>
                ))}
                {combatLogs.length === 0 && (
                  <div className="text-green-700 italic">
                    NO RECENT COMBAT ACTIVITY
                  </div>
                )}
                <div className="animate-pulse text-green-400 mt-2">_</div>
              </div>
            </div>

            <MachineSpiritConsole
              satisfaction={satisfaction}
              setSatisfaction={setSatisfaction}
            />

            <div className="bg-[#1a0505] border-2 border-red-900 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_30px_rgba(255,0,0,0.1)] group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
              <div className="purity-seal absolute top-2 left-2 text-[8px]">
                PURITY
              </div>
              <div className="purity-seal absolute bottom-2 right-2 text-[8px]">
                FAITH
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600 mb-2 group-hover:animate-bounce btn-interactive" />
              <h3 className="text-red-500 font-gothic font-bold text-lg mb-1 tracking-widest uppercase">
                Ultimate Sanction
              </h3>
              <p className="font-tech text-[10px] text-zinc-400 mb-3">
                Authorization: Lord Inquisitor Only
              </p>
              <button
                onClick={handleExterminatus}
                disabled={exterminatus || favor < 3}
                className="w-full py-3 bg-red-700 hover:bg-red-600 disabled:bg-gray-800 text-black font-black font-gothic tracking-[0.2em] border-2 border-red-400 shadow-[0_0_20px_rgba(255,0,0,0.6)] active:scale-95 transition-transform mt-2 relative overflow-hidden group btn-interactive"
              >
                <span className="relative z-10">
                  {exterminatus ? 'ARMED...' : 'EXTERMINATUS'}
                </span>
                <div className="absolute inset-0 bg-red-500/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-red-500/30 translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-500"></div>
              </button>
              {!exterminatus && favor < 3 && (
                <div className="mt-1 font-tech text-[9px] text-red-400 animate-pulse">
                  <Sparkles className="w-3 h-3 inline mr-1" /> COST: 3 FAVOR
                </div>
              )}
              {exterminatus && (
                <div className="mt-2 font-tech text-[10px] text-red-400 animate-pulse">
                  <Gauge className="w-3 h-3 inline mr-1" /> ARMAGEDDON PATTERN
                  ACTIVATED
                </div>
              )}
            </div>

            {chaosLevel > 75 && (
              <div className="bg-purple-900/30 border-2 border-purple-700 p-4 animate-[pulse_1s_ease-in-out_infinite]">
                <h3 className="font-gothic font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> WARP TAINT CRITICAL
                </h3>
                <p className="font-tech text-[10px] text-purple-300">
                  IMMEDIATE PURIFICATION REQUIRED. YOUR SOUL IS BEING WEIGHED.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 bg-black border-t-4 border-[#5a2e2e] py-6 text-center mt-12">
        <p className="font-gothic text-[#c5a059] text-xs tracking-[0.3em] opacity-60">
          ++ IMPERIUM OF MAN • HOLY GOD-EMPEROR • TERRA ++
        </p>
        <p className="font-tech text-[9px] text-zinc-600 mt-1">
          "Innocence proves nothing" - Inquisitorial Proverb
        </p>
      </footer>
    </div>
  );
};

export default InquisitionDashboard;
