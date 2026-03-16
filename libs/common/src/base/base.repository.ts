import { NotFoundException } from '@nestjs/common';
import { MindsaiPrismaService } from '@app/database';
import { TransactionClient } from './transaction.types';

export interface PrismaDelegate {
  findUnique(args: { where: { id: number } }): Promise<unknown>;
  findMany(args?: {
    skip?: number;
    take?: number;
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<unknown[]>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
}

export abstract class BaseRepository {
  protected constructor(
    protected readonly prisma: MindsaiPrismaService,
    protected readonly modelName: string,
  ) {}

  protected abstract get delegate(): PrismaDelegate;

  async findOneOrFail<T = unknown>(id: number): Promise<T> {
    const entity = await this.delegate.findUnique({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`${this.modelName} with id ${id} not found`);
    }
    return entity as T;
  }

  async findWithPagination<T = unknown>(
    skip: number,
    take: number,
    where?: Record<string, unknown>,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<{ data: T[]; total: number }> {
    const [data, total] = await Promise.all([
      this.delegate.findMany({ skip, take, where, orderBy }),
      this.delegate.count({ where }),
    ]);
    return { data: data as T[], total };
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.delegate.count({ where: { id } as Record<string, unknown> });
    return count > 0;
  }

  async withTransaction<R>(callback: (tx: TransactionClient) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(callback);
  }
}
