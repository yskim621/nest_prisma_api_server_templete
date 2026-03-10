import { MindsaiPrismaService } from '../../prisma/nest_template.prisma.service';

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
  protected get model() {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * 새 엔티티 생성
   */
  async create(data: CreateDTO): Promise<T> {
    return this.model.create({ data });
  }

  /**
   * 모든 엔티티 조회
   */
  async findAll(): Promise<T[]> {
    return this.model.findMany();
  }

  /**
   * ID로 엔티티 조회
   */
  async findOne(id: number): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
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
    return this.model.update({ where: { id }, data });
  }

  /**
   * 엔티티 삭제
   */
  async remove(id: number): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  /**
   * 조건으로 엔티티 목록 조회
   */
  async findMany(where?: Record<string, any>): Promise<T[]> {
    return this.model.findMany({ where });
  }

  /**
   * 조건으로 단일 엔티티 조회
   */
  async findFirst(where: Record<string, any>): Promise<T | null> {
    return this.model.findFirst({ where });
  }

  /**
   * 엔티티 수 조회
   */
  async count(where?: Record<string, any>): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * 페이지네이션 조회
   */
  async findWithPagination(
    skip: number,
    take: number,
    where?: Record<string, any>,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<{ data: T[]; total: number }> {
    const [data, total] = await Promise.all([
      this.model.findMany({ skip, take, where, orderBy }),
      this.model.count({ where }),
    ]);
    return { data, total };
  }

  /**
   * 트랜잭션 실행
   */
  async withTransaction<R>(
    callback: (tx: any) => Promise<R>,
  ): Promise<R> {
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
