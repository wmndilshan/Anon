import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { ReviewsService } from './reviews.service';

function makePrisma() {
  return {
    product: { findFirst: jest.fn() },
    review: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;
}

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new ReviewsService(prisma);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('throws BadRequestException when rating is below 1', async () => {
      await expect(
        service.create('u1', 'p1', { rating: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when rating is above 5', async () => {
      await expect(
        service.create('u1', 'p1', { rating: 6 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);
      await expect(service.create('u1', 'p1', { rating: 4 })).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when user already reviewed the product', async () => {
      prisma.product.findFirst.mockResolvedValue({ id: 'p1' });
      prisma.review.findUnique.mockResolvedValue({ id: 'r1' });
      await expect(service.create('u1', 'p1', { rating: 5 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates and returns the review', async () => {
      prisma.product.findFirst.mockResolvedValue({ id: 'p1' });
      prisma.review.findUnique.mockResolvedValue(null);
      const review = { id: 'r1', rating: 4, status: ReviewStatus.PENDING };
      prisma.review.create.mockResolvedValue(review);

      const result = await service.create('u1', 'p1', { rating: 4, title: 'Great' });
      expect(result).toBe(review);
      expect(prisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: ReviewStatus.PENDING }),
        }),
      );
    });
  });

  // ── listForProduct ────────────────────────────────────────────────────────

  describe('listForProduct', () => {
    it('returns only APPROVED reviews', async () => {
      prisma.$transaction.mockResolvedValue([2, [{ id: 'r1' }, { id: 'r2' }]]);
      const result = await service.listForProduct('p1');
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });
  });

  // ── adminList ─────────────────────────────────────────────────────────────

  describe('adminList', () => {
    it('returns all reviews when no status filter is provided', async () => {
      prisma.$transaction.mockResolvedValue([10, []]);
      const result = await service.adminList();
      expect(result.total).toBe(10);
    });

    it('returns reviews filtered by status', async () => {
      prisma.$transaction.mockResolvedValue([3, []]);
      const result = await service.adminList(ReviewStatus.PENDING);
      expect(result.total).toBe(3);
    });
  });

  // ── moderate ──────────────────────────────────────────────────────────────

  describe('moderate', () => {
    it('updates the review status', async () => {
      const updated = { id: 'r1', status: ReviewStatus.APPROVED };
      prisma.review.update.mockResolvedValue(updated);

      const result = await service.moderate('r1', ReviewStatus.APPROVED);
      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: { status: ReviewStatus.APPROVED },
      });
      expect(result).toBe(updated);
    });
  });
});
