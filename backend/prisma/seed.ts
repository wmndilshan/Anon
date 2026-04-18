import {
  BannerPlacement,
  CouponAppliesTo,
  CouponType,
  CmsPageType,
  FulfillmentStatus,
  OrderStatus,
  PaymentProviderKind,
  PaymentStatus,
  PrismaClient,
  ProductStatus,
  ShippingRateType,
  UserStatus,
  UserType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { key: 'system.super', description: 'Full access' },
    { key: 'catalog.read', description: 'View catalog' },
    { key: 'catalog.write', description: 'Manage catalog' },
    { key: 'orders.read', description: 'View orders' },
    { key: 'orders.write', description: 'Update orders / fulfillment' },
    { key: 'users.read', description: 'View customers' },
    { key: 'cms.read', description: 'View CMS' },
    { key: 'cms.write', description: 'Manage CMS' },
    { key: 'settings.write', description: 'Site settings' },
    { key: 'analytics.read', description: 'Analytics' },
    { key: 'reviews.moderate', description: 'Moderate reviews' },
    { key: 'audit.read', description: 'View audit log' },
    { key: 'roles.read', description: 'View roles' },
    { key: 'roles.write', description: 'Manage roles & staff' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      create: p,
      update: { description: p.description },
    });
  }

  const permMap = Object.fromEntries(
    (await prisma.permission.findMany()).map((x) => [x.key, x.id]),
  );

  const roles = [
    {
      slug: 'super_admin',
      name: 'Super Admin',
      description: 'All permissions',
      keys: ['system.super'],
    },
    {
      slug: 'admin',
      name: 'Admin',
      description: 'Operations admin',
      keys: [
        'catalog.read',
        'catalog.write',
        'orders.read',
        'orders.write',
        'users.read',
        'cms.read',
        'cms.write',
        'settings.write',
        'analytics.read',
        'reviews.moderate',
        'audit.read',
        'roles.read',
        'roles.write',
      ],
    },
    {
      slug: 'catalog_manager',
      name: 'Catalog Manager',
      keys: ['catalog.read', 'catalog.write', 'analytics.read'],
    },
    {
      slug: 'order_manager',
      name: 'Order Manager',
      keys: ['orders.read', 'orders.write', 'users.read', 'analytics.read'],
    },
    {
      slug: 'content_manager',
      name: 'Content Manager',
      keys: ['cms.read', 'cms.write', 'reviews.moderate'],
    },
    {
      slug: 'support_manager',
      name: 'Support',
      keys: ['users.read', 'orders.read'],
    },
  ];

  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { slug: r.slug },
      create: { slug: r.slug, name: r.name, description: r.description ?? null },
      update: { name: r.name, description: r.description ?? null },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    for (const key of r.keys) {
      const pid = permMap[key];
      if (pid) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: pid },
        });
      }
    }
  }

  const superRole = await prisma.role.findUniqueOrThrow({ where: { slug: 'super_admin' } });
  const adminHash = await bcrypt.hash('ChangeMe!Admin123', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'admin@marketplace.local' },
    create: {
      email: 'admin@marketplace.local',
      passwordHash: adminHash,
      firstName: 'Super',
      lastName: 'Admin',
      userType: UserType.STAFF,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
    update: { passwordHash: adminHash },
  });
  await prisma.userRole.deleteMany({ where: { userId: staff.id } });
  await prisma.userRole.create({ data: { userId: staff.id, roleId: superRole.id } });

  const brand = await prisma.brand.upsert({
    where: { slug: 'acme' },
    create: { slug: 'acme', name: 'Acme Co', description: 'Demo brand' },
    update: {},
  });

  const catElectronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    create: { slug: 'electronics', name: 'Electronics', sortOrder: 1 },
    update: {},
  });
  await prisma.category.upsert({
    where: { slug: 'phones' },
    create: { slug: 'phones', name: 'Phones', parentId: catElectronics.id, sortOrder: 1 },
    update: {},
  });

  const coll = await prisma.collection.upsert({
    where: { slug: 'spring-sale' },
    create: { slug: 'spring-sale', name: 'Spring Sale', featured: true },
    update: {},
  });

  const zone = await prisma.shippingZone.upsert({
    where: { id: 'seed-zone-us' },
    create: { id: 'seed-zone-us', name: 'United States', countries: ['US'] },
    update: { name: 'United States', countries: ['US'] },
  });

  const method = await prisma.shippingMethod.upsert({
    where: { code: 'standard' },
    create: { code: 'standard', name: 'Standard shipping', sortOrder: 1 },
    update: {},
  });

  await prisma.shippingRateRule.deleteMany({ where: { zoneId: zone.id, methodId: method.id } });
  await prisma.shippingRateRule.create({
    data: {
      zoneId: zone.id,
      methodId: method.id,
      rateType: ShippingRateType.FLAT,
      price: 9.99,
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: 'demo-handset' },
    create: {
      slug: 'demo-handset',
      name: 'Demo Handset Pro',
      description: 'A flexible demo product with variants.',
      shortDescription: 'Demo SKU-backed variants',
      status: ProductStatus.ACTIVE,
      brandId: brand.id,
      featured: true,
      isNew: true,
      onSale: true,
    },
    update: {
      name: 'Demo Handset Pro',
      status: ProductStatus.ACTIVE,
      brandId: brand.id,
    },
  });

  await prisma.productCategory.deleteMany({ where: { productId: product.id } });
  await prisma.productCategory.create({
    data: { productId: product.id, categoryId: catElectronics.id, isPrimary: true },
  });
  await prisma.productCollection.deleteMany({ where: { productId: product.id } });
  await prisma.productCollection.create({
    data: { productId: product.id, collectionId: coll.id },
  });

  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  await prisma.productImage.create({
    data: {
      productId: product.id,
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      alt: 'Handset',
      sortOrder: 0,
    },
  });

  const optColor = await prisma.productOption.create({
    data: { productId: product.id, name: 'Color', sortOrder: 0 },
  });
  const valBlack = await prisma.productOptionValue.create({
    data: { optionId: optColor.id, value: 'Black', sortOrder: 0 },
  });
  const valWhite = await prisma.productOptionValue.create({
    data: { optionId: optColor.id, value: 'White', sortOrder: 1 },
  });

  await prisma.productVariant.deleteMany({ where: { productId: product.id } });
  const v1 = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: 'DEMO-BLK-128',
      title: 'Black / 128GB',
      price: 799,
      compareAtPrice: 899,
      isDefault: true,
      weightGrams: 200,
    },
  });
  const v2 = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: 'DEMO-WHT-128',
      title: 'White / 128GB',
      price: 799,
      isDefault: false,
      weightGrams: 200,
    },
  });

  await prisma.variantOptionValue.deleteMany({
    where: { variantId: { in: [v1.id, v2.id] } },
  });
  await prisma.variantOptionValue.createMany({
    data: [
      { variantId: v1.id, optionValueId: valBlack.id },
      { variantId: v2.id, optionValueId: valWhite.id },
    ],
  });

  await prisma.inventory.deleteMany({ where: { variantId: { in: [v1.id, v2.id] } } });
  await prisma.inventory.createMany({
    data: [
      { variantId: v1.id, quantityOnHand: 50 },
      { variantId: v2.id, quantityOnHand: 25 },
    ],
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    create: {
      code: 'WELCOME10',
      type: CouponType.PERCENTAGE,
      value: 10,
      appliesTo: CouponAppliesTo.ALL,
      minOrderAmount: 50,
      usageLimitPerUser: 1,
      isActive: true,
    },
    update: {},
  });

  await prisma.banner.deleteMany({});
  await prisma.banner.create({
    data: {
      placement: BannerPlacement.HERO,
      title: 'New season drop',
      subtitle: 'Same API for web & mobile',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600',
      linkUrl: '/catalog/products',
      sortOrder: 0,
      isActive: true,
    },
  });

  await prisma.homepageSection.deleteMany({});
  await prisma.homepageSection.create({
    data: {
      key: 'featured_collections',
      title: 'Featured collections',
      sortOrder: 0,
      isActive: true,
    },
  });

  await prisma.cmsPage.upsert({
    where: { slug: 'about' },
    create: {
      slug: 'about',
      title: 'About us',
      pageType: CmsPageType.ABOUT,
      body: '<p>Demo marketplace platform.</p>',
      isPublished: true,
      publishedAt: new Date(),
    },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: 'footer' },
    create: {
      key: 'footer',
      value: {
        columns: [
          { title: 'Shop', links: [{ label: 'Catalog', href: '/catalog' }] },
          { title: 'Support', links: [{ label: 'Contact', href: '/contact' }] },
        ],
      },
    },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: 'contact' },
    create: {
      key: 'contact',
      value: { email: 'support@marketplace.local', phone: '+1-555-0100' },
    },
    update: {},
  });

  const demoCustomerHash = await bcrypt.hash('Customer123!', 12);
  await prisma.user.upsert({
    where: { email: 'customer@demo.local' },
    create: {
      email: 'customer@demo.local',
      passwordHash: demoCustomerHash,
      firstName: 'Demo',
      lastName: 'Customer',
      userType: UserType.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
    update: { passwordHash: demoCustomerHash },
  });

  const cust = await prisma.user.findUniqueOrThrow({ where: { email: 'customer@demo.local' } });
  await prisma.address.deleteMany({ where: { userId: cust.id, line1: '1 Market St' } });
  const addr = await prisma.address.create({
    data: {
      userId: cust.id,
      fullName: 'Demo Customer',
      line1: '1 Market St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
      isDefault: true,
    },
  });

  await prisma.order.deleteMany({ where: { orderNumber: 'ORD-SEED-1' } });
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-SEED-1',
      userId: cust.id,
      status: OrderStatus.DELIVERED,
      fulfillmentStatus: FulfillmentStatus.FULFILLED,
      subtotal: 799,
      discountTotal: 0,
      shippingTotal: 9.99,
      taxTotal: 0,
      grandTotal: 808.99,
      shippingAddressId: addr.id,
      billingAddressId: addr.id,
      placedAt: new Date(),
      items: {
        create: [
          {
            variantId: v1.id,
            productId: product.id,
            skuSnapshot: v1.sku,
            nameSnapshot: product.name,
            variantTitle: v1.title,
            unitPrice: v1.price,
            quantity: 1,
            lineTotal: v1.price,
          },
        ],
      },
      payments: {
        create: {
          provider: PaymentProviderKind.STRIPE,
          status: PaymentStatus.CAPTURED,
          amount: 808.99,
          capturedAt: new Date(),
        },
      },
      shipments: {
        create: {
          methodId: method.id,
          status: FulfillmentStatus.FULFILLED,
          trackingNumber: '1Z999AA10123456784',
          shippedAt: new Date(),
          deliveredAt: new Date(),
        },
      },
    },
  });

  console.log('Seed complete. Staff: admin@marketplace.local / ChangeMe!Admin123');
  console.log('Customer: customer@demo.local / Customer123!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
