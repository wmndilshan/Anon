import { NotFoundException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

function makePrisma() {
  return {
    wishlistItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
}

describe('WishlistService', () => {
  let service: WishlistService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new WishlistService(prisma);
  });

  // ── list ──────────────────────────────────────────────────────────────────

  describe('list', () => {
    it('returns wishlist items for user', async () => {
      const items = [{ id: 'wi1' }];
      prisma.wishlistItem.findMany.mockResolvedValue(items);

      const result = await service.list('user-1');
      expect(result).toBe(items);
      expect(prisma.wishlistItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  // ── add ───────────────────────────────────────────────────────────────────

  describe('add', () => {
    it('upserts the item and returns the updated list', async () => {
      prisma.wishlistItem.upsert.mockResolvedValue({});
      const items = [{ id: 'wi1' }];
      prisma.wishlistItem.findMany.mockResolvedValue(items);

      const result = await service.add('user-1', 'prod-1');

      expect(prisma.wishlistItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_productId: { userId: 'user-1', productId: 'prod-1' } },
        }),
      );
      expect(result).toBe(items);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('throws NotFoundException when item is not in the wishlist', async () => {
      prisma.wishlistItem.findUnique.mockResolvedValue(null);
      await expect(service.remove('user-1', 'prod-1')).rejects.toThrow(NotFoundException);
    });

    it('deletes the item and returns the updated list', async () => {
      const item = { id: 'wi1' };
      prisma.wishlistItem.findUnique.mockResolvedValue(item);
      prisma.wishlistItem.delete.mockResolvedValue({});
      const items: any[] = [];
      prisma.wishlistItem.findMany.mockResolvedValue(items);

      const result = await service.remove('user-1', 'prod-1');

      expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({ where: { id: 'wi1' } });
      expect(result).toBe(items);
    });
  });
});
