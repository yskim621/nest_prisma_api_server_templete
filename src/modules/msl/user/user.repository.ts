import { Injectable } from '@nestjs/common';
import { User } from '../../../../prisma/generated/nest_prisma_template';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository, PrismaDelegate } from '../../../common/base';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

/**
 * UserRepository - 사용자 데이터 접근 계층
 *
 * BaseRepository로부터 findOneOrFail, findWithPagination, exists, withTransaction을 상속받고,
 * CRUD 및 도메인 쿼리는 Prisma Client를 직접 사용하여 완전한 타입 안전성을 유지합니다.
 */
@Injectable()
export class UserRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'User');
  }

  protected get delegate(): PrismaDelegate {
    return this.prisma.user;
  }

  /**
   * 사용자 생성
   */
  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * 모든 사용자 조회 (비밀번호 제외)
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true, accountStatus: true },
    });
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * 사용자 정보 수정
   */
  async update(id: number, data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  /**
   * 사용자 삭제
   */
  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * 계정 상태로 사용자 목록 조회
   */
  async findByAccountStatus(status: string): Promise<User[]> {
    return this.prisma.user.findMany({ where: { accountStatus: status } });
  }
}
