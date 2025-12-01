import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../../src/hooks/useGameEngine';

jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' }, token: 'test-token' })
}));

describe('useGameEngine', () => {
  it('calculates skill values per rulebook', () => {
    const { result } = renderHook(() => useGameEngine());
    
    // Mock character
    act(() => {
      result.current.selectCharacter({
        id: 'char-1',
        intelligence: 42,
        skills: [{ skill_id: 'skill-1', modifier_level: 2, is_known: true }]
      });
    });

    // Mock skills
    act(() => {
      result.current.skills = [{
        id: 'skill-1',
        main_skill: { governing_characteristic: 'intelligence' },
        tier: 'basic'
      }];
    });

    const charSkills = result.current.getCharacterSkills();
    expect(charSkills[0].current_value).toBe(52); // 42 + 10 (level 2)
    expect(charSkills[0].final_target).toBe(52); // No untrained penalty
  });
});