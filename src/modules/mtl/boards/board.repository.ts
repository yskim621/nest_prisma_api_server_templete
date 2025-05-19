import { Injectable, NotFoundException } from '@nestjs/common';
import { MindsaiPrismaService } from 'src/prisma/mindsai_platform.prisma.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { UserDto } from '../user/dto/user.dto';

// 기능과 상관없는 샘플용 코드
@Injectable()
export class BoardRepository {
  constructor(private prisma: MindsaiPrismaService) {}

  async create(data: CreateBoardDto) {
    return this.prisma.board.create({ data });
  }

  async createMultiData(data: CreateBoardDto) {
    // 기본 트렌젝션 => 배열 형태로 열거
    return this.prisma.$transaction([this.prisma.board.create({ data }), this.prisma.board.create({ data })]);
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
      const foundBoardData = await this.findOne(id); // Throws if not found
      if (!foundBoardData) {
        throw new NotFoundException();
      }
      foundBoardData.status = contentStatus.HIDDEN;
      await tx.board.update({ where: { id }, data });

      const foundUser = await tx.user.findUnique({ where: { id: foundBoardData.id } });
      foundUser.name = '휴먼계정';
      await tx.user.update({ where: { id: foundBoardData.id }, data: foundUser });
    });
  }

  async remove(id: number) {
    return this.prisma.board.delete({ where: { id } });
  }
}
