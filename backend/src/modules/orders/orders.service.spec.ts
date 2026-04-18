import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

function makePrisma() {
  return {
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    shipment: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;
}

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new OrdersService(prisma);
  });

  // ── listMine ──────────────────────────────────────────────────────────────

  describe('listMine', () => {
    it('returns paginated orders for the user', async () => {
      prisma.$transaction.mockResolvedValue([3, [{ id: 'o1' }, { id: 'o2' }, { id: 'o3' }]]);

      const result = await service.listMine('user-1');
      expect(result).toMatchObject({ total: 3, page: 1, pageSize: 20, pageCount: 1 });
    });

    it('respects custom page and pageSize', async () => {
      prisma.$transaction.mockResolvedValue([30, []]);

      const result = await service.listMine('user-1', 2, 10);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
    });
  });

  // ── getMine ───────────────────────────────────────────────────────────────

  describe('getMine', () => {
    it('returns order when it belongs to user', async () => {
      const order = { id: 'o1', userId: 'user-1' };
      prisma.order.findFirst.mockResolvedValue(order);

      const result = await service.getMine('user-1', 'o1');
      expect(result).toBe(order);
    });

    it('throws NotFoundException when order not found', async () => {
      prisma.order.findFirst.mockResolvedValue(null);
      await expect(service.getMine('user-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminList ─────────────────────────────────────────────────────────────

  describe('adminList', () => {
    it('returns all orders without status filter', async () => {
      prisma.$transaction.mockResolvedValue([5, []]);
      const result = await service.adminList();
      expect(result.total).toBe(5);
    });

    it('applies status filter when provided', async () => {
      prisma.$transaction.mockResolvedValue([2, []]);
      const result = await service.adminList(1, 20, 'PAID');
      expect(result).toMatchObject({ total: 2 });
    });
  });

  // ── adminGet ──────────────────────────────────────────────────────────────

  describe('adminGet', () => {
    it('returns the order when found', async () => {
      const order = { id: 'o1' };
      prisma.order.findUnique.mockResolvedValue(order);

      const result = await service.adminGet('o1');
      expect(result).toBe(order);
    });

    it('throws NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.adminGet('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── adminUpdateStatus ─────────────────────────────────────────────────────

  describe('adminUpdateStatus', () => {
    it('throws NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.adminUpdateStatus('missing', { status: 'PAID' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates order status', async () => {
      const order = { id: 'o1', status: 'PENDING_PAYMENT' };
      prisma.order.findUnique.mockResolvedValue(order);
      const updated = { id: 'o1', status: 'PAID' };
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          order: { update: jest.fn().mockResolvedValue(updated) },
          shipment: { findFirst: jest.fn().mockResolvedValue(null), update: jest.fn() },
        });
      });

      const result = await service.adminUpdateStatus('o1', { status: 'PAID' });
      expect(result).toMatchObject({ status: 'PAID' });
    });

    it('updates shipment tracking number when provided', async () => {
      const order = { id: 'o1' };
      prisma.order.findUnique.mockResolvedValue(order);

      const shipmentUpdate = jest.fn().mockResolvedValue({});
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          order: { update: jest.fn().mockResolvedValue(order) },
          shipment: {
            findFirst: jest.fn().mockResolvedValue({ id: 'ship-1' }),
            update: shipmentUpdate,
          },
        });
      });

      await service.adminUpdateStatus('o1', { trackingNumber: 'TRK123' });
      expect(shipmentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ trackingNumber: 'TRK123' }) }),
      );
    });
  });
});
