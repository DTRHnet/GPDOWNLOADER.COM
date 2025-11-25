import { describe, it, expect, beforeEach } from '@jest/globals';
import { searchRouter } from '@/server/routers/search';
import { prisma } from '@/lib/db';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('@/lib/redis');
jest.mock('@/server/utils/rate-limit');

describe('Search Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate search input', async () => {
    const caller = searchRouter.createCaller({
      session: null,
      prisma: prisma as any,
      req: {} as Request,
    });

    await expect(
      caller.search({
        page: 0, // Invalid: must be >= 1
        limit: 20,
      })
    ).rejects.toThrow();
  });

  it('should enforce limit maximum', async () => {
    const caller = searchRouter.createCaller({
      session: null,
      prisma: prisma as any,
      req: {} as Request,
    });

    await expect(
      caller.search({
        page: 1,
        limit: 200, // Invalid: max is 100
      })
    ).rejects.toThrow();
  });
});
