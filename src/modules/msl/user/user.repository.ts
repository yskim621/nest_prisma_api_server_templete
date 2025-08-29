import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { MindsaiPrismaService } from 'src/prisma/nest_template.prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: MindsaiPrismaService) {}

  async create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  async findAll() {
    // return (await this.prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } })) as UserDto[];
    // const foundUserList = (await this.prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } })) as UserDto[];
    const foundUserList: UserDto[] = await this.prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true, accountStatus: true, password: true },
    });

    // Post-process
    return foundUserList;
  }

  async findOne(id: number) {
    // Pre-process

    // Business Logic
    const user: UserDto = await this.prisma.user.findUnique({ where: { id } });

    // Post-process
    return user;
  }

  async update(id: number, data: UpdateUserDto) {
    // Pre-process
    await this.findOne(id); // Throws if not found

    // Business Logic
    const user: UserDto = await this.prisma.user.update({ where: { id }, data });

    // Post-process
    return user;
  }

  async remove(id: number) {
    const foundUser: UserDto = await this.findOne(id);
    return this.prisma.user.delete({ where: { id: foundUser.id } });
  }

  // async withTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) {
  //   return this.prisma.$transaction(callback);
  // }
}
