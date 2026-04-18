import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';

function buildCartWithItems(items: any[] = []) {
  return {
    id: 'cart-1',
    userId: 'user-1',
    currency: 'USD',
    items,
  };
}

function buildVariant(overrides: Partial<any> = {}) {
  return {
    id: 'variant-1',
    sku: 'SKU-001',
    title: 'Default',
    price: { toString: () => '10.00' },
    trackInventory: false,
    product: {
      id: 'prod-1',
      name: 'Test Product',
      slug: 'test-product',
      status: 'ACTIVE',
      images: [{ url: 'https://img.test/1.jpg' }],
    },
    inventory: null,
    ...overrides,
  };
}

function makePrisma() {
  return {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    productVariant: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  } as any;
}

describe('CartService', () => {
  let service: CartService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CartService(prisma);
  });

  // ── getOrCreateCart ───────────────────────────────────────────────────────

  describe('getOrCreateCart', () => {
    it('returns existing cart when found', async () => {
      const cart = buildCartWithItems();
      prisma.cart.findUnique.mockResolvedValue(cart);

      const result = await service.getOrCreateCart('user-1');
      expect(result.cartId).toBe('cart-1');
    });

    it('creates a cart when none exists', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      const cart = buildCartWithItems();
      prisma.cart.create.mockResolvedValue(cart);

      const result = await service.getOrCreateCart('user-1');
      expect(prisma.cart.create).toHaveBeenCalled();
      expect(result.cartId).toBe('cart-1');
    });

    it('calculates subtotal correctly', async () => {
      const variant = {
        id: 'v1',
        sku: 'S',
        title: null,
        price: 10,
        trackInventory: false,
        product: { id: 'p1', name: 'P', slug: 'p', images: [] },
        inventory: null,
      };
      const cart = {
        id: 'cart-1',
        currency: 'USD',
        items: [{ id: 'ci-1', quantity: 3, variant }],
      };
      prisma.cart.findUnique.mockResolvedValue(cart);

      const result = await service.getOrCreateCart('user-1');
      expect(result.subtotal).toBe(30);
    });
  });

  // ── addItem ───────────────────────────────────────────────────────────────

  describe('addItem', () => {
    it('throws BadRequestException when quantity is less than 1', async () => {
      await expect(service.addItem('user-1', 'v-1', 0)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when variant not found', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(null);
      await expect(service.addItem('user-1', 'v-missing', 1)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when inventory is insufficient', async () => {
      const variant = buildVariant({
        trackInventory: true,
        inventory: { quantityOnHand: 2 },
        product: { id: 'p1', name: 'P', slug: 'p', status: 'ACTIVE', images: [] },
      });
      prisma.productVariant.findFirst.mockResolvedValue(variant);
      prisma.cart.upsert.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
      prisma.cartItem.findUnique.mockResolvedValue({ quantity: 2 });

      await expect(service.addItem('user-1', 'variant-1', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('upserts cart item and returns updated cart', async () => {
      const variant = buildVariant({
        product: { id: 'p1', name: 'P', slug: 'p', status: 'ACTIVE', images: [] },
      });
      prisma.productVariant.findFirst.mockResolvedValue(variant);
      prisma.cart.upsert.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
      prisma.cartItem.upsert.mockResolvedValue({});

      const fullCart = buildCartWithItems([{ id: 'ci-1', quantity: 1, variant }]);
      prisma.cart.findUnique.mockResolvedValue(fullCart);

      const result = await service.addItem('user-1', 'variant-1', 1);
      expect(prisma.cartItem.upsert).toHaveBeenCalled();
      expect(result.cartId).toBe('cart-1');
    });
  });

  // ── setQuantity ───────────────────────────────────────────────────────────

  describe('setQuantity', () => {
    it('removes item when quantity is set to 0', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      // removeItem path: cart not found -> returns empty cart
      const result = await service.setQuantity('user-1', 'v-1', 0);
      expect(result).toMatchObject({ items: [] });
    });

    it('throws NotFoundException when cart does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      await expect(service.setQuantity('user-1', 'v-1', 2)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when stock is insufficient', async () => {
      prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1' });
      prisma.productVariant.findUnique.mockResolvedValue({
        id: 'v-1',
        trackInventory: true,
        inventory: { quantityOnHand: 1 },
      });
      await expect(service.setQuantity('user-1', 'v-1', 5)).rejects.toThrow(BadRequestException);
    });

    it('updates the cart item quantity', async () => {
      const variant = buildVariant();
      const cart = buildCartWithItems([{ id: 'ci-1', quantity: 2, variant }]);
      prisma.cart.findUnique.mockResolvedValueOnce({ id: 'cart-1' });
      prisma.productVariant.findUnique.mockResolvedValue(variant);
      prisma.cartItem.update.mockResolvedValue({});
      prisma.cart.findUnique.mockResolvedValueOnce(cart);

      const result = await service.setQuantity('user-1', 'variant-1', 3);
      expect(prisma.cartItem.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  // ── removeItem ────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('returns empty result when cart does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      const result = await service.removeItem('user-1', 'v-1');
      expect(result).toMatchObject({ cartId: null, items: [] });
    });

    it('deletes the cart item', async () => {
      const cart = buildCartWithItems();
      prisma.cart.findUnique.mockResolvedValueOnce({ id: 'cart-1' });
      prisma.cartItem.deleteMany.mockResolvedValue({});
      prisma.cart.findUnique.mockResolvedValueOnce(cart);

      await service.removeItem('user-1', 'v-1');
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1', variantId: 'v-1' },
      });
    });
  });

  // ── clear ─────────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('deletes all items when cart exists', async () => {
      const cart = buildCartWithItems();
      prisma.cart.findUnique.mockResolvedValueOnce({ id: 'cart-1' });
      prisma.cartItem.deleteMany.mockResolvedValue({});
      prisma.cart.findUnique.mockResolvedValueOnce(cart);

      await service.clear('user-1');
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-1' } });
    });

    it('still returns cart when no cart exists', async () => {
      const cart = buildCartWithItems();
      prisma.cart.findUnique
        .mockResolvedValueOnce(null) // no existing cart in clear()
        .mockResolvedValueOnce(cart); // getOrCreateCart calls findUnique again

      const result = await service.clear('user-1');
      expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
