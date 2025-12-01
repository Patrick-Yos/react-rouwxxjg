import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import howler from 'howler';

// Centralized game state engine - Roll20-grade architecture
export const useGameEngine = () => {
  const { user, token } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  const [weapons, setWeapons] = useState([]);
  
  // Auto-save queue for optimistic updates
  const saveQueue = useRef([]);
  const saveTimeout = useRef(null);

  // Initialize: Load characters and global skill catalog
  useEffect(() => {
    if (user) {
      loadCharacters();
      loadSkills();
      loadWeapons();
    }
  }, [user]);

  // Auto-save debounce (500ms)
  const queueSave = useCallback((callback) => {
    saveQueue.current.push(callback);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    
    saveTimeout.current = setTimeout(async () => {
      const queue = [...saveQueue.current];
      saveQueue.current = [];
      
      for (const save of queue) {
        try { await save(); } catch (e) { console.error('Auto-save failed:', e); }
      }
    }, 500);
  }, []);

  // API: Load characters
  const loadCharacters = async () => {
    const res = await fetch('/api/characters', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCharacters(data);
  };

  // API: Load skill catalog
  const loadSkills = async () => {
    const res = await fetch('/api/skills', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSkills(await res.json());
  };

  // API: Load weapons
  const loadWeapons = async () => {
    const res = await fetch('/api/weapons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setWeapons(await res.json());
  };

  // Get skills for selected character with calculated values
  const getCharacterSkills = useCallback(() => {
    if (!selectedCharacter) return [];
    
    return skills.map(skill => {
      const charSkill = selectedCharacter.skills?.find(cs => cs.skill_id === skill.id);
      const baseValue = selectedCharacter[skill.main_skill.governing_characteristic];
      const levelBonus = charSkill ? (charSkill.modifier_level - 1) * 10 : 0;
      const untrainedPenalty = (!charSkill?.is_known && skill.tier === 'basic') ? -20 : 0;
      
      return {
        ...skill,
        character_skill: charSkill,
        base_value: baseValue,
        current_value: baseValue + levelBonus,
        untrained_penalty: untrainedPenalty,
        final_target: baseValue + levelBonus + untrainedPenalty
      };
    });
  }, [selectedCharacter, skills]);

  // Roll20-grade skill roll
  const rollSkill = async (skillId, modifier = 0, modifierReason = '') => {
    if (!selectedCharacter || isRolling) return;
    
    setIsRolling(true);
    
    // SFX: Roll initiation
    new Howl({ src: ['/sfx/dice-shake.mp3'], volume: 0.3 }).play();

    try {
      const res = await fetch('/api/rolls/skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          character_id: selectedCharacter.id,
          skill_id: skillId,
          modifier,
          modifier_reason: modifierReason
        })
      });

      const result = await res.json();
      
      // Animate dice box (integrates with existing DiceBox)
      if (window.diceBox) {
        await window.diceBox.roll(`1d100`);
        await new Promise(r => setTimeout(r, 1500)); // Animation duration
      }

      setRollResult(result);
      
      // SFX: Success/failure
      const sfx = new Howl({
        src: [result.is_critical_failure ? '/sfx/fumble.mp3' : 
              result.is_critical_success ? '/sfx/critical.mp3' :
              result.success ? '/sfx/success.mp3' : '/sfx/failure.mp3'],
        volume: 0.4
      });
      sfx.play();

      // Auto-close modal after 3s (Roll20 behavior)
      setTimeout(() => {
        setRollResult(null);
        setIsRolling(false);
      }, 3000);

      return result;
    } catch (err) {
      console.error('Roll failed:', err);
      setIsRolling(false);
      throw err;
    }
  };

  // Combat engine: Initiative
  const rollInitiative = useCallback(async (combatants) => {
    const rolls = await Promise.all(combatants.map(async (c) => {
      const roll = rollD100(); // Secure client-side for initiative only
      const agility = c.agility;
      const total = roll + Math.floor(agility / 10);
      
      return { ...c, initiative: total, raw_roll: roll };
    }));
    
    return rolls.sort((a, b) => b.initiative - a.initiative);
  }, []);

  // Optimistic update for skill modifier level
  const updateSkillLevel = useCallback((characterSkillId, newLevel) => {
    // Optimistic UI update
    setSelectedCharacter(prev => ({
      ...prev,
      skills: prev.skills.map(cs => 
        cs.id === characterSkillId ? { ...cs, modifier_level: newLevel } : cs
      )
    }));

    // Queue async save
    queueSave(async () => {
      await fetch(`/api/character-skills/${characterSkillId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ modifier_level: newLevel })
      });
    });
  }, [token, queueSave]);

  return {
    // State
    characters,
    selectedCharacter,
    skills: getCharacterSkills(),
    weapons,
    rollResult,
    isRolling,
    
    // Actions
    selectCharacter: setSelectedCharacter,
    rollSkill,
    rollInitiative,
    updateSkillLevel,
    loadCharacters
  };
};