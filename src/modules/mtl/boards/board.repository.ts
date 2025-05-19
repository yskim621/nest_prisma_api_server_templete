import { Injectable, NotFoundException } from '@nestjs/common';
import { MindsaiPrismaService } from 'src/prisma/mindsai_platform.prisma.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

// 기능과 상관없는 샘플용 코드
@Injectable()
export class BoardRepository {
  constructor(private prisma: MindsaiPrismaService) {}

  async create(data: CreateBoardDto) {
    return this.prisma.board.create({ data });
  }

  async createMultiData(data: CreateBoardDto) {
    return this.prisma.$transaction([this.prisma.board.create({ data }), this.prisma.board.create({ data })]);
  }

  async findAll() {
    return this.prisma.board.findMany();
  }

  async findOne(id: number) {
    return this.prisma.board.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateBoardDto) {


    await this.prisma.$transaction(async (tx) => {
      const foundBoardData = await this.findOne(id); // Throws if not found
      if (!foundBoardData) {
        throw new NotFoundException();
      }

      foundBoardData.status = contentStatus.HIDDEN;
      await tx.board.create({ data });
    });

    return this.prisma.board.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.board.delete({ where: { id } });
  }
}
