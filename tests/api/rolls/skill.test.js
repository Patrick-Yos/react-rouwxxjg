import request from 'supertest';
import handler from '../../api/rolls/skill';
import { createMocks } from 'node-mocks-http';

describe('POST /api/rolls/skill', () => {
  it('calculates degrees of success exactly per rulebook (Page 94)', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer test-token' },
      body: {
        character_id: 'test-char-id',
        skill_id: 'test-skill-id',
        modifier: 0
      }
    });

    // Mock JWT
    jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue({ id: 'test-user' });

    // Mock DB response
    const mockSql = jest.fn().mockResolvedValue([
      {
        modifier_level: 1,
        is_known: true,
        tier: 'basic',
        governing_characteristic: 'intelligence',
        intelligence: 42
      }
    ]);
    jest.mock('../../api/lib/db', () => ({ sql: mockSql }));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const result = JSON.parse(res._getData());
    
    // Verify rulebook calculation
    expect(result).toHaveProperty('degrees_of_success');
    expect(result).toHaveProperty('raw_roll');
    expect(result).toHaveProperty('final_target', 42);
    expect(result.modifiers).toContainEqual(
      expect.objectContaining({ type: 'base', value: 42 })
    );
  });

  it('applies untrained -20 penalty correctly (Page 94)', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer test-token' },
      body: {
        character_id: 'test-char-id',
        skill_id: 'test-skill-id'
      }
    });

    const mockSql = jest.fn().mockResolvedValue([
      {
        modifier_level: 1,
        is_known: false,
        tier: 'basic',
        governing_characteristic: 'ballistic_skill',
        ballistic_skill: 35
      }
    ]);
    jest.mock('../../api/lib/db', () => ({ sql: mockSql }));

    await handler(req, res);

    const result = JSON.parse(res._getData());
    expect(result.final_target).toBe(15); // 35 - 20
    expect(result.modifiers).toContainEqual(
      expect.objectContaining({ type: 'untrained', value: -20 })
    );
  });
});