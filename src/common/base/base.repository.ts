import { NotFoundException } from '@nestjs/common';
import { MindsaiPrismaService } from '../../prisma/nest_template.prisma.service';
import { TransactionClient } from './transaction.types';

/**
 * Prisma delegate가 만족해야 하는 최소 인터페이스.
 * BaseRepository의 유틸리티 메서드에서 사용하는 메서드만 정의합니다.
 * 자식 클래스에서는 this.prisma.user, this.prisma.board 등을 직접 사용하므로
 * Prisma의 전체 타입 안전성이 그대로 유지됩니다.
 */
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

/**
 * BaseRepository - Prisma가 제공하지 않는 유틸리티 메서드를 위한 추상 클래스
 *
 * Prisma Client가 이미 제공하는 CRUD 메서드(create, findMany, update, delete 등)는
 * 재정의하지 않습니다. 자식 Repository에서 this.prisma.[model]을 직접 사용하여
 * Prisma의 완전한 타입 안전성(select, include, cursor, distinct 등)을 활용하세요.
 *
 * 이 클래스가 제공하는 메서드:
 * - findOneOrFail: ID로 조회, 없으면 NotFoundException
 * - findWithPagination: 병렬 count + findMany 페이지네이션
 * - exists: 존재 여부 확인
 * - withTransaction: Prisma interactive transaction 래퍼
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRepository extends BaseRepository {
 *   constructor(prisma: MindsaiPrismaService) {
 *     super(prisma, 'User');
 *   }
 *
 *   protected get delegate() { return this.prisma.user; }
 *
 *   async create(data: CreateUserDto) {
 *     return this.prisma.user.create({ data }); // Prisma 타입 완전 활용
 *   }
 * }
 * ```
 */
export abstract class BaseRepository {
  protected constructor(
    protected readonly prisma: MindsaiPrismaService,
    protected readonly modelName: string,
  ) {}

  /**
   * 자식 클래스에서 Prisma delegate를 반환합니다.
   * 예: return this.prisma.user;
   */
  protected abstract get delegate(): PrismaDelegate;

  /**
   * ID로 엔티티 조회 (없으면 NotFoundException)
   */
  async findOneOrFail<T = unknown>(id: number): Promise<T> {
    const entity = await this.delegate.findUnique({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`${this.modelName} with id ${id} not found`);
    }
    return entity as T;
  }

  /**
   * 페이지네이션 조회 (count와 findMany를 병렬 실행)
   */
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

  /**
   * 엔티티 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.delegate.count({ where: { id } as Record<string, unknown> });
    return count > 0;
  }

  /**
   * Prisma interactive transaction 실행
   */
  async withTransaction<R>(callback: (tx: TransactionClient) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(callback);
  }
}
