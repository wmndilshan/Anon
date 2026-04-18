import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    actorId: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Prisma.InputJsonValue;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.adminActivityLog.create({ data: params });
  }

  async list(page = 1, pageSize = 50) {
    const skip = (page - 1) * pageSize;
    const [total, items] = await this.prisma.$transaction([
      this.prisma.adminActivityLog.count(),
      this.prisma.adminActivityLog.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { email: true, id: true } } },
      }),
    ]);
    return { items, total, page, pageSize };
  }
}
