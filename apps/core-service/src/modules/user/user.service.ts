import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    return this.userRepository.create(createUserDto);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findOne(id: number) {
    return this.userRepository.findOneOrFail(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.findOneOrFail(id);
    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    await this.userRepository.findOneOrFail(id);
    return this.userRepository.remove(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findByAccountStatus(status: string) {
    return this.userRepository.findByAccountStatus(status);
  }
}
