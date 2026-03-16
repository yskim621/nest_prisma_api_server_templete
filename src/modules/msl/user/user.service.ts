import { Injectable } from '@nestjs/common';
import { User } from '../../../../prisma/generated/nest_prisma_template';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';

/**
 * UserService - 사용자 비즈니스 로직 계층
 *
 * Repository를 통해 데이터 접근을 분리하고,
 * 비즈니스 로직이 필요한 곳에 직접 구현합니다.
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.create(createUserDto);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findOne(id: number) {
    return this.userRepository.findOneOrFail<User>(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.findOneOrFail(id);
    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number): Promise<User> {
    await this.userRepository.findOneOrFail(id);
    return this.userRepository.remove(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByAccountStatus(status: string): Promise<User[]> {
    return this.userRepository.findByAccountStatus(status);
  }
}
