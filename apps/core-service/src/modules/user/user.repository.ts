import { Injectable } from '@nestjs/common';
import { MindsaiPrismaService } from '@app/database';
import { BaseRepository, PrismaDelegate } from '@app/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserRepository extends BaseRepository {
  constructor(prisma: MindsaiPrismaService) {
    super(prisma, 'User');
  }

  protected get delegate(): PrismaDelegate {
    return this.prisma.user;
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true, accountStatus: true },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByAccountStatus(status: string) {
    return this.prisma.user.findMany({ where: { accountStatus: status } });
  }
}
