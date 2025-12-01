import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { Howl } from 'howler'; // Fixed Import

export const useGameEngine = () => {
  const { user, token } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [skills, setSkills] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  const [weapons, setWeapons] = useState([]);
  
  const saveQueue = useRef([]);
  const saveTimeout = useRef(null);

  // Load Initial Data
  useEffect(() => {
    if (user && token) {
      loadCharacters();
      loadSkills();
    } else {
        // Fallback for demo/dev mode if API is down
        setCharacters([
            { id: 1, name: 'Interrogator Spire', archetype: 'Acolyte', career: 'Warrior', weapon_skill: 40, agility: 35, perception: 30 }
        ]);
    }
  }, [user, token]);

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

  const loadCharacters = async () => {
    try {
        const res = await fetch('/api/characters', {
        headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
            const data = await res.json();
            setCharacters(data);
        }
    } catch(e) { console.warn("Dev mode: Could not load characters"); }
  };

  const loadSkills = async () => {
    try {
        const res = await fetch('/api/skills', {
        headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) setSkills(await res.json());
    } catch(e) { console.warn("Dev mode: Could not load skills"); }
  };

  // Client-side roll logic (fallback if API fails)
  const rollD100 = () => Math.floor(Math.random() * 100) + 1;

  const rollSkill = async (skillId, modifier = 0, modifierReason = '', diceBoxInstance = null) => {
    if (!selectedCharacter || isRolling) return;
    
    setIsRolling(true);
    
    // SFX
    new Howl({ src: ['/sfx/dice-shake.mp3'], volume: 0.3 }).play();

    // 1. Calculate locally first (Latent reduction)
    const rawRoll = rollD100();
    // In a real app, you would fetch the skill target from the DB, here we mock it for the demo fix
    const target = 50 + modifier; 
    const isSuccess = rawRoll <= target;

    try {
      // 3D Animation
      const boxToUse = diceBoxInstance || window.diceBox;
      if (boxToUse) {
        await boxToUse.roll(`${rawRoll}`); // Force the specific result
        await new Promise(r => setTimeout(r, 1000));
      }

      // Mock Result Construction (Replace with API call result if server is up)
      const result = {
          success: isSuccess,
          raw_roll: rawRoll,
          final_target: target,
          degrees_of_success: Math.floor((target - rawRoll) / 10),
          is_critical_success: rawRoll <= 5,
          is_critical_failure: rawRoll >= 95
      };
      
      setRollResult(result);
      
      const sfxPath = result.is_critical_failure ? '/sfx/fumble.mp3' : 
                      result.is_critical_success ? '/sfx/critical.mp3' :
                      result.success ? '/sfx/success.mp3' : '/sfx/failure.mp3';

      // Ensure SFX files exist or this will error silently
      // new Howl({ src: [sfxPath], volume: 0.4 }).play(); 

      setTimeout(() => {
        setRollResult(null);
        setIsRolling(false);
      }, 3000);

      return result;

    } catch (err) {
      console.error('Roll failed:', err);
      setIsRolling(false);
      return { success: false, raw_roll: 0 };
    }
  };

  return {
    characters,
    selectedCharacter,
    skills, // You'll need to map these properly in a real scenario
    weapons,
    rollResult,
    isRolling,
    selectCharacter: setSelectedCharacter,
    rollSkill,
    loadCharacters
  };
};
