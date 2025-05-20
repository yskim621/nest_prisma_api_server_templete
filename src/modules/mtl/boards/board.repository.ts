import { Injectable, NotFoundException } from '@nestjs/common';
import { MindsaiPrismaService } from 'src/prisma/mindsai_platform.prisma.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

// 기능과 상관없는 샘플용 코드
@Injectable()
export class BoardRepository {
  constructor(private prisma: MindsaiPrismaService) {}

  async create(data: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        title: data.title,
        description: data.description,
        user: {
          connect: { id: data.userId },
        },
      },
    });
  }

  async createMultiData(data: CreateBoardDto) {
    // 기본 트렌젝션 => 배열 형태로 열거
    return this.prisma.$transaction([
      this.prisma.board.create({
        data: {
          title: data.title,
          description: data.description,
          user: {
            connect: { id: data.userId },
          },
        },
      }),
      this.prisma.board.create({
        data: {
          title: data.title,
          description: data.description,
          user: {
            connect: { id: data.userId },
          },
        },
      }),
    ]);
  }

  async findAll() {
    return this.prisma.board.findMany();
  }

  async findOne(id: number) {
    return this.prisma.board.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateBoardDto) {
    // 고급 트렌젝션 => 각 트렌잭션 별로 전/후 처리가 가능
    await this.prisma.$transaction(async (tx) => {
      const foundUserData = await tx.user.findUnique({ where: { id: data.userId } }); // Throws if not found
      if (!foundUserData) {
        throw new NotFoundException();
      }

      if (foundUserData.account_status === accountStatus.ACTIVE) {
        return;
      }

      await tx.board.update({
        where: { id },
        data: { status: contentStatus.HIDDEN },
      });
    });
  }

  async remove(id: number) {
    return this.prisma.board.delete({ where: { id } });
  }
}
