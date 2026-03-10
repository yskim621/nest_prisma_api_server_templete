import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';
import { BaseCrudService } from '../../../common/base';

/**
 * UserService - BaseCrudService를 확장한 사용자 서비스
 *
 * 기본 CRUD 기능은 BaseCrudService에서 상속받으며,
 * 사용자 도메인에 특화된 비즈니스 로직만 추가로 구현합니다.
 */
@Injectable()
export class UserService extends BaseCrudService<UserDto, CreateUserDto, UpdateUserDto, UserRepository> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  /**
   * 모든 사용자 조회
   * @deprecated findAll() 사용 권장
   */
  async getAllUsers(): Promise<UserDto[]> {
    return this.findAll();
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<UserDto | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * 계정 상태로 사용자 목록 조회
   */
  async findByAccountStatus(status: string): Promise<UserDto[]> {
    return this.userRepository.findByAccountStatus(status);
  }
}
