import { BaseRepository } from './base.repository';

/**
 * BaseCrudService - 공통 CRUD 서비스 로직을 위한 추상 클래스
 *
 * @template T - 엔티티 타입
 * @template CreateDTO - 생성 DTO 타입
 * @template UpdateDTO - 수정 DTO 타입
 * @template Repository - 레포지토리 타입
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService extends BaseCrudService<User, CreateUserDto, UpdateUserDto, UserRepository> {
 *   constructor(userRepository: UserRepository) {
 *     super(userRepository);
 *   }
 * }
 * ```
 */
export abstract class BaseCrudService<
  T,
  CreateDTO,
  UpdateDTO,
  Repository extends BaseRepository<T, CreateDTO, UpdateDTO>,
> {
  protected constructor(protected readonly repository: Repository) {}

  /**
   * 새 엔티티 생성
   */
  async create(data: CreateDTO): Promise<T> {
    return this.repository.create(data);
  }

  /**
   * 모든 엔티티 조회
   */
  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  /**
   * ID로 엔티티 조회
   */
  async findOne(id: number): Promise<T | null> {
    return this.repository.findOne(id);
  }

  /**
   * ID로 엔티티 조회 (없으면 예외)
   */
  async findOneOrFail(id: number): Promise<T> {
    return this.repository.findOneOrFail(id);
  }

  /**
   * 엔티티 수정
   */
  async update(id: number, data: UpdateDTO): Promise<T> {
    return this.repository.update(id, data);
  }

  /**
   * 엔티티 삭제
   */
  async remove(id: number): Promise<T> {
    return this.repository.remove(id);
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
    return this.repository.findWithPagination(skip, take, where, orderBy);
  }

  /**
   * 엔티티 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    return this.repository.exists(id);
  }
}
