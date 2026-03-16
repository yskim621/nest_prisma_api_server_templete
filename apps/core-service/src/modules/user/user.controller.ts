import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CORE_PATTERNS } from '@app/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(CORE_PATTERNS.USER_CREATE)
  async create(@Payload() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @MessagePattern(CORE_PATTERNS.USER_FIND_ALL)
  async findAll() {
    return this.userService.findAll();
  }

  @MessagePattern(CORE_PATTERNS.USER_FIND_BY_ID)
  async findOne(@Payload() data: { id: number }) {
    return this.userService.findOne(data.id);
  }

  @MessagePattern(CORE_PATTERNS.USER_UPDATE)
  async update(@Payload() data: { id: number; dto: UpdateUserDto }) {
    return this.userService.update(data.id, data.dto);
  }

  @MessagePattern(CORE_PATTERNS.USER_DELETE)
  async remove(@Payload() data: { id: number }) {
    return this.userService.remove(data.id);
  }

  @MessagePattern(CORE_PATTERNS.USER_FIND_BY_EMAIL)
  async findByEmail(@Payload() data: { email: string }) {
    return this.userService.findByEmail(data.email);
  }
}
