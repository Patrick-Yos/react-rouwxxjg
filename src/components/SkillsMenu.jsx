import { useState, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { SkillRollModal } from './SkillRollModal';
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';
import Anima from '../utils/animation';

export const SkillsMenu = () => {
  const { skills, rollSkill, selectedCharacter } = useGameEngine();
  const [expandedMain, setExpandedMain] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  // Group skills by main skill category
  const groupedSkills = skills.reduce((acc, skill) => {
    const main = skill.main_skill.code;
    if (!acc[main]) acc[main] = [];
    acc[main].push(skill);
    return acc;
  }, {});

  const handleSkillClick = useCallback((skill) => {
    setSelectedSkill(skill);
    Anima.combat('.skill-card');
  }, []);

  const handleQuickRoll = useCallback((skill, modifier) => {
    rollSkill(skill.id, modifier);
    setHoveredSkill(null);
  }, [rollSkill]);

  if (!selectedCharacter) {
    return (
      <div className="bg-[#111] border-2 border-[#5a2e2e] p-8 text-center">
        <div className="text-red-500 font-gothic text-xl">NO CHARACTER SELECTED</div>
        <div className="text-[#c5a059] font-tech text-xs mt-2">Access the Character Rostrum to proceed.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border-2 border-[#5a2e2e] p-4">
      <h3 className="font-gothic font-bold text-[#c5a059] mb-4 flex items-center gap-2">
        <ChevronDown className="w-4 h-4" /> IMPERIAL SKILL MATRIX
      </h3>
      
      <div className="space-y-3">
        {Object.entries(groupedSkills).map(([mainSkill, skillList]) => (
          <div key={mainSkill} className="border border-[#333] hover:border-[#c5a059] transition-all">
            <button
              onClick={() => setExpandedMain(expandedMain === mainSkill ? null : mainSkill)}
              className="w-full p-3 bg-[#0a0a0a] hover:bg-[#1a1a1a] flex items-center justify-between transition-all"
            >
              <span className="font-tech text-xs text-[#c5a059] uppercase tracking-wider">
                {mainSkill.replace('_', ' ')}
              </span>
              {expandedMain === mainSkill ? <ChevronDown /> : <ChevronRight />}
            </button>

            {expandedMain === mainSkill && (
              <div className="p-3 bg-[#050505] space-y-2">
                {skillList.map(skill => {
                  const isHovered = hoveredSkill === skill.id;
                  const finalTarget = skill.final_target;
                  const canUseUntrained = skill.tier !== 'specialist';
                  
                  return (
                    <div
                      key={skill.id}
                      className="skill-card relative p-3 bg-[#111] border border-[#444] hover:border-[#c5a059] transition-all cursor-pointer group"
                      onMouseEnter={() => setHoveredSkill(skill.id)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      onClick={() => handleSkillClick(skill)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-tech text-sm text-[#c5a059]">
                            {skill.name}
                            {skill.character_skill?.is_known && (
                              <span className="ml-2 text-green-500 text-xs">● KNOWN</span>
                            )}
                          </div>
                          <div className="font-tech text-xs text-zinc-500">
                            {skill.tier} • {skill.main_skill.governing_characteristic}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-red-500 font-mono text-lg font-bold">
                            {skill.current_value}
                          </div>
                          <div className="font-tech text-xs text-zinc-400">
                            {skill.modifier_level === 1 ? 'BASE' : 
                             skill.modifier_level === 2 ? '+10' : '+20'}
                          </div>
                        </div>
                      </div>

                      {/* Hover Preview Panel (Roll20-style) */}
                      {isHovered && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 p-3 bg-black border border-[#c5a059] shadow-2xl">
                          <div className="font-tech text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Target Number:</span>
                              <span className="text-green-400 font-bold">{finalTarget}</span>
                            </div>
                            
                            {!skill.character_skill?.is_known && skill.tier === 'basic' && (
                              <div className="flex justify-between text-red-400">
                                <span>Untrained:</span>
                                <span>-20</span>
                              </div>
                            )}
                            
                            {skill.character_skill?.modifier_level > 1 && (
                              <div className="flex justify-between text-[#c5a059]">
                                <span>Modifier Level:</span>
                                <span>+{(skill.character_skill.modifier_level - 1) * 10}</span>
                              </div>
                            )}
                            
                            <div className="border-t border-[#333] pt-2 mt-2">
                              <div className="text-[10px] text-zinc-500 mb-1">QUICK MODIFIERS:</div>
                              <div className="flex gap-1">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleQuickRoll(skill, 10); }}
                                  className="px-2 py-1 bg-[#333] text-green-400 hover:bg-green-900 transition-all text-xs"
                                >
                                  +10
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleQuickRoll(skill, 20); }}
                                  className="px-2 py-1 bg-[#333] text-green-400 hover:bg-green-900 transition-all text-xs"
                                >
                                  +20
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleQuickRoll(skill, -10); }}
                                  className="px-2 py-1 bg-[#333] text-red-400 hover:bg-red-900 transition-all text-xs"
                                >
                                  -10
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleQuickRoll(skill, -20); }}
                                  className="px-2 py-1 bg-[#333] text-red-400 hover:bg-red-900 transition-all text-xs"
                                >
                                  -20
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Roll Modal */}
      {selectedSkill && (
        <SkillRollModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
};