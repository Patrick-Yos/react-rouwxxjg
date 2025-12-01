import { useState, useEffect } from 'react';
import { useGameEngine } from './useGameEngine';
import { DiceBox } from '@3d-dice/dice-box';
import { X, Zap, AlertTriangle, Trophy } from 'lucide-react';
import Anima from '../utils/animation';

export const SkillRollModal = ({ skill, onClose }) => {
  const { rollSkill, isRolling } = useGameEngine();
  const [customModifier, setCustomModifier] = useState(0);
  const [rollResult, setRollResult] = useState(null);
  const diceBoxRef = useState(null);

  useEffect(() => {
    // Initialize DiceBox for animation
    const initBox = async () => {
      const box = new DiceBox('#skill-dice-canvas', {
        id: '#skill-dice-box',
        assetPath: 'assets/',
        origin: 'https://unpkg.com/@3d-dice/dice-box@1.1.4/dist/',
        theme: 'default',
        themeColor: '#c5a059',
        scale: 35
      });
      diceBoxRef.current = box;
      await box.init();
    };
    initBox();

    // Keyboard: ESC to close, R to reroll
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key.toLowerCase() === 'r') handleRoll();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleRoll = async () => {
    const result = await rollSkill(skill.id, customModifier, 'Custom Modifier');
    setRollResult(result);
    
    // Animate result flash
    if (result.success) {
      Anima.weaponFire('.roll-result-success');
    } else {
      Anima.shake('.roll-result-failure', 5);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#111] border-4 border-[#c5a059] shadow-[0_0_50px_rgba(197,160,89,0.3)]">
        {/* Header */}
        <div className="bg-red-950 p-4 flex justify-between items-center border-b-4 border-[#c5a059]">
          <h3 className="font-gothic font-bold text-[#c5a059] text-xl flex items-center gap-2">
            <Zap className="w-6 h-6" /> SKILL TEST: {skill.name}
          </h3>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X className="w-8 h-8 text-red-500 hover:text-white" />
          </button>
        </div>

        {/* Dice Canvas */}
        <div className="p-6 bg-black relative">
          <div id="skill-dice-canvas" className="w-full h-48 mb-4"></div>

          {/* Result Display */}
          {rollResult && !isRolling && (
            <div className={`roll-result-${rollResult.success ? 'success' : 'failure'} 
                           absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center`}>
              <div className={`
                text-8xl font-black font-mono mb-2 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]
                ${rollResult.is_critical_success ? 'text-green-400 animate-pulse' :
                  rollResult.is_critical_failure ? 'text-red-500 animate-pulse' :
                  rollResult.success ? 'text-green-400' : 'text-red-400'}
              `}>
                {rollResult.raw_roll}
              </div>
              
              <div className="font-tech text-sm space-y-1">
                <div className="text-[#c5a059]">
                  Target: {rollResult.final_target}
                </div>
                <div className={rollResult.degrees_of_success > 0 ? 'text-green-400' : 'text-red-400'}>
                  {rollResult.degrees_of_success > 0 
                    ? `${rollResult.degrees_of_success}° Success` 
                    : `${Math.abs(rollResult.degrees_of_success)}° Failure`}
                </div>
              </div>

              {/* Critical/Fumble Badge */}
              {rollResult.is_critical_success && (
                <div className="mt-2 text-green-500 font-tech text-xs animate-bounce">
                  <Trophy className="w-4 h-4 inline mr-1" /> CRITICAL SUCCESS
                </div>
              )}
              {rollResult.is_critical_failure && (
                <div className="mt-2 text-red-500 font-tech text-xs animate-pulse">
                  <AlertTriangle className="w-4 h-4 inline mr-1" /> CATASTROPHIC FAILURE
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-[#0a0a0a] border-t-4 border-[#c5a059]">
          <div className="mb-4">
            <label className="font-tech text-xs text-zinc-400 block mb-2">CUSTOM MODIFIER</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customModifier}
                onChange={(e) => setCustomModifier(Number(e.target.value))}
                className="flex-1 bg-black border border-[#333] text-[#c5a059] px-3 py-2 font-tech"
                placeholder="Enter modifier..."
              />
              <button
                onClick={() => setCustomModifier(0)}
                className="px-4 py-2 bg-[#333] text-zinc-400 hover:bg-[#555] transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          <button
            onClick={handleRoll}
            disabled={isRolling}
            className="w-full py-4 bg-[#c5a059] text-black font-gothic font-bold text-lg uppercase tracking-wider 
                       hover:bg-[#e5c079] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRolling ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                THE EMPEROR'S WILL BEING CALCULATED...
              </span>
            ) : (
              'EXECUTE SKILL TEST'
            )}
          </button>

          {/* Predicted Outcome */}
          {!rollResult && (
            <div className="mt-4 p-3 bg-[#111] border border-[#333] font-tech text-xs">
              <div className="text-zinc-400 mb-1">PREDICTED SUCCESS RATE:</div>
              <div className="text-green-400 font-bold">
                {Math.max(0, Math.min(100, skill.final_target + customModifier))}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

};
