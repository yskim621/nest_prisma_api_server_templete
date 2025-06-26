import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { MindsaiPrismaService } from 'src/prisma/mindsai_platform.prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: MindsaiPrismaService) {}

  async create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  async findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
  }

  async findOne(id: number) {
    // Pre-process

    // Business Logic
    const user = await this.prisma.user.findUnique({ where: { id } });

    // Post-process
    return user;
  }

  async update(id: number, data: UpdateUserDto) {
    // Pre-process
    await this.findOne(id); // Throws if not found

    // Business Logic
    const user = await this.prisma.user.update({ where: { id }, data });

    // Post-process
    return user;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }

  async withTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(callback);
  }
}
