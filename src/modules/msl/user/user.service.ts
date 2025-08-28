import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data: CreateUserDto) {
    return await this.userRepository.create(data);
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async findOne(id: number) {
    // Pre-process

    // Business Logic
    const user = await this.userRepository.findOne(id);

    // Post-process
    return user;
  }

  async update(id: number, data: UpdateUserDto) {
    return await this.userRepository.update(id, data);
  }

  async remove(id: number) {
    return await this.userRepository.remove(id);
  }
}
