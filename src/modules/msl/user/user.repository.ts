import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { MindsaiPrismaService } from 'src/prisma/nest_template.prisma.service';
import { BaseRepository } from '../../../common/base';

/**
 * UserRepository - BaseRepository를 확장한 사용자 레포지토리
 *
 * 기본 CRUD 기능은 BaseRepository에서 상속받으며,
 * 사용자 도메인에 특화된 메서드만 추가로 구현합니다.
 */
@Injectable()
export class UserRepository extends BaseRepository<UserDto, CreateUserDto, UpdateUserDto> {
  constructor(prisma: MindsaiPrismaService) {
    super(prisma, 'user');
  }

  /**
   * 모든 사용자 조회 (선택적 필드만)
   */
  async findAll(): Promise<UserDto[]> {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true, accountStatus: true, password: true },
    });
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<UserDto | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * 계정 상태로 사용자 목록 조회
   */
  async findByAccountStatus(status: string): Promise<UserDto[]> {
    return this.prisma.user.findMany({ where: { accountStatus: status } });
  }
}
