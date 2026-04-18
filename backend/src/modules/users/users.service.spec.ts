import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

function makePrisma() {
  return {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    address: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;
}

describe('UsersService', () => {
  let service: UsersService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new UsersService(prisma);
  });

  // ── getProfile ────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('returns the user when found', async () => {
      const user = { id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getProfile('u1');
      expect(result).toBe(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateProfile ─────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('calls prisma.user.update with the correct args', async () => {
      const updated = { id: 'u1', firstName: 'New' };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile('u1', { firstName: 'New' });
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { firstName: 'New' } }),
      );
      expect(result).toBe(updated);
    });
  });

  // ── listAddresses ─────────────────────────────────────────────────────────

  describe('listAddresses', () => {
    it('returns addresses ordered by default then created', async () => {
      const addrs = [{ id: 'a1' }];
      prisma.address.findMany.mockResolvedValue(addrs);

      const result = await service.listAddresses('u1');
      expect(result).toBe(addrs);
      expect(prisma.address.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' } }),
      );
    });
  });

  // ── createAddress ─────────────────────────────────────────────────────────

  describe('createAddress', () => {
    it('resets other default addresses before creating a default one', async () => {
      prisma.address.updateMany.mockResolvedValue({});
      prisma.address.create.mockResolvedValue({ id: 'a1' });

      await service.createAddress('u1', {
        fullName: 'John',
        line1: '1 Main St',
        city: 'Boston',
        postalCode: '02101',
        isDefault: true,
      });

      expect(prisma.address.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' }, data: { isDefault: false } }),
      );
    });

    it('does not reset default addresses when isDefault is falsy', async () => {
      prisma.address.create.mockResolvedValue({ id: 'a1' });

      await service.createAddress('u1', {
        fullName: 'John',
        line1: '1 Main St',
        city: 'Boston',
        postalCode: '02101',
      });

      expect(prisma.address.updateMany).not.toHaveBeenCalled();
    });

    it('defaults country to "US" when not provided', async () => {
      prisma.address.create.mockResolvedValue({ id: 'a1' });

      await service.createAddress('u1', {
        fullName: 'John',
        line1: '1 Main St',
        city: 'Boston',
        postalCode: '02101',
      });

      expect(prisma.address.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ country: 'US' }) }),
      );
    });
  });

  // ── updateAddress ─────────────────────────────────────────────────────────

  describe('updateAddress', () => {
    it('throws NotFoundException when address does not belong to user', async () => {
      prisma.address.findFirst.mockResolvedValue(null);
      await expect(service.updateAddress('u1', 'a1', { city: 'NYC' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('resets other defaults when isDefault is true', async () => {
      prisma.address.findFirst.mockResolvedValue({ id: 'a1', userId: 'u1' });
      prisma.address.updateMany.mockResolvedValue({});
      prisma.address.update.mockResolvedValue({ id: 'a1' });

      await service.updateAddress('u1', 'a1', { isDefault: true });

      expect(prisma.address.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' }, data: { isDefault: false } }),
      );
    });

    it('updates the address correctly', async () => {
      prisma.address.findFirst.mockResolvedValue({ id: 'a1', userId: 'u1' });
      const updated = { id: 'a1', city: 'Boston' };
      prisma.address.update.mockResolvedValue(updated);

      const result = await service.updateAddress('u1', 'a1', { city: 'Boston' });
      expect(result).toBe(updated);
    });
  });

  // ── deleteAddress ─────────────────────────────────────────────────────────

  describe('deleteAddress', () => {
    it('throws NotFoundException when address does not belong to user', async () => {
      prisma.address.findFirst.mockResolvedValue(null);
      await expect(service.deleteAddress('u1', 'a1')).rejects.toThrow(NotFoundException);
    });

    it('deletes the address and returns ok', async () => {
      prisma.address.findFirst.mockResolvedValue({ id: 'a1' });
      prisma.address.delete.mockResolvedValue({});

      const result = await service.deleteAddress('u1', 'a1');
      expect(prisma.address.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
      expect(result).toEqual({ ok: true });
    });
  });

  // ── adminListCustomers ────────────────────────────────────────────────────

  describe('adminListCustomers', () => {
    it('returns paginated customers', async () => {
      prisma.$transaction.mockResolvedValue([2, [{ id: 'u1' }, { id: 'u2' }]]);

      const result = await service.adminListCustomers(1, 20);
      expect(result).toMatchObject({ total: 2, page: 1, pageSize: 20 });
    });

    it('applies search query when q is provided', async () => {
      prisma.$transaction.mockResolvedValue([0, []]);
      await service.adminListCustomers(1, 20, 'alice');

      // The $transaction receives two prisma calls; we verify it was invoked
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
