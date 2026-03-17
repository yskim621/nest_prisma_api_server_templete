import { Injectable } from '@nestjs/common';
import { MindsaiPrismaService } from '@app/database';
import { BaseRepository, PrismaDelegate } from '@app/common';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

@Injectable()
export class BoardRepository extends BaseRepository {
  constructor(prisma: MindsaiPrismaService) {
    super(prisma, 'Board');
  }

  protected get delegate(): PrismaDelegate {
    return this.prisma.board;
  }

  async create(data: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        userId: data.userId,
      },
    });
  }

  async findAll() {
    return this.prisma.board.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async findById(id: number) {
    return this.prisma.board.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async update(id: number, data: UpdateBoardDto) {
    return this.prisma.board.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.board.delete({ where: { id } });
  }

  async findByUserId(userId: number) {
    return this.prisma.board.findMany({
      where: { userId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async bulkCreate(items: CreateBoardDto[]) {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.board.create({
          data: {
            title: item.title,
            description: item.description,
            status: item.status,
            userId: item.userId,
          },
        }),
      ),
    );
  }
}
