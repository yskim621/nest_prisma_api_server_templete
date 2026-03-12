/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { MindsaiPrismaService } from '../../prisma/nest_template.prisma.service';
import { TransactionClient } from './transaction.types';

/**
 * Prisma 모델 Delegate 타입 (동적 모델 접근용)
 */
type PrismaModelDelegate = {
  create: (args: { data: any }) => Promise<any>;
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: { where: { id: number } }) => Promise<any>;
  findFirst: (args: { where: any }) => Promise<any>;
  update: (args: { where: { id: number }; data: any }) => Promise<any>;
  delete: (args: { where: { id: number } }) => Promise<any>;
  count: (args?: { where?: any }) => Promise<number>;
};

/**
 * BaseRepository - 공통 CRUD 작업을 위한 추상 클래스
 *
 * @template T - 엔티티 타입
 * @template CreateDTO - 생성 DTO 타입
 * @template UpdateDTO - 수정 DTO 타입
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
 *   constructor(prisma: MindsaiPrismaService) {
 *     super(prisma, 'user');
 *   }
 * }
 * ```
 */
export abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
  protected constructor(
    protected readonly prisma: MindsaiPrismaService,
    protected readonly modelName: string,
  ) {}

  /**
   * Prisma 모델 delegate 반환
   */
  protected get model(): PrismaModelDelegate {
    return (this.prisma as any)[this.modelName] as PrismaModelDelegate;
  }

  /**
   * 새 엔티티 생성
   */
  async create(data: CreateDTO): Promise<T> {
    return (await this.model.create({ data })) as T;
  }

  /**
   * 모든 엔티티 조회
   */
  async findAll(): Promise<T[]> {
    return (await this.model.findMany()) as T[];
  }

  /**
   * ID로 엔티티 조회
   */
  async findOne(id: number): Promise<T | null> {
    return (await this.model.findUnique({ where: { id } })) as T | null;
  }

  /**
   * ID로 엔티티 조회 (없으면 예외)
   */
  async findOneOrFail(id: number): Promise<T> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new Error(`${this.modelName} with id ${id} not found`);
    }
    return entity;
  }

  /**
   * 엔티티 수정
   */
  async update(id: number, data: UpdateDTO): Promise<T> {
    return (await this.model.update({ where: { id }, data })) as T;
  }

  /**
   * 엔티티 삭제
   */
  async remove(id: number): Promise<T> {
    return (await this.model.delete({ where: { id } })) as T;
  }

  /**
   * 조건으로 엔티티 목록 조회
   */
  async findMany(where?: Record<string, unknown>): Promise<T[]> {
    return (await this.model.findMany({ where })) as T[];
  }

  /**
   * 조건으로 단일 엔티티 조회
   */
  async findFirst(where: Record<string, unknown>): Promise<T | null> {
    return (await this.model.findFirst({ where })) as T | null;
  }

  /**
   * 엔티티 수 조회
   */
  async count(where?: Record<string, unknown>): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * 페이지네이션 조회
   */
  async findWithPagination(
    skip: number,
    take: number,
    where?: Record<string, unknown>,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<{ data: T[]; total: number }> {
    const [data, total] = await Promise.all([this.model.findMany({ skip, take, where, orderBy }), this.model.count({ where })]);
    return { data: data as T[], total };
  }

  /**
   * 트랜잭션 실행
   */
  async withTransaction<R>(callback: (tx: TransactionClient) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(callback);
  }

  /**
   * 엔티티 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.model.count({ where: { id } });
    return count > 0;
  }
}
