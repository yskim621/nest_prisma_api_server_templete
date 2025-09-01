import { HttpException, Injectable } from '@nestjs/common';
import { MindsaiPrismaService } from 'src/prisma/nest_template.prisma.service';
import { Board, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { FindOneQueryException, FindQueryException } from '../../../common/exceptions/common.exception';
import { generateException } from '../../../common/exceptions/common.error-handler';
import { ContentStatus } from './board.enum';
import { AccountStatus } from '../user/user.enum';

// 기능과 상관없는 샘플용 코드
@Injectable()
export class BoardRepository {
  constructor(private prisma: MindsaiPrismaService) {}

  async create(data: CreateBoardDto): Promise<Board> {
    try {
      const createdBoard = await this.prisma.board.create({
        data: {
          title: data.title,
          description: data.description,
          status: data.status as string, // 기본값 설정
          user: {
            connect: { id: data.userId },
          },
        },
      });
      return {
        ...createdBoard,
        status: createdBoard.status as ContentStatus,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        generateException(error);
      }
    }
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
    try {
      return this.prisma.board.findMany();
    } catch (error) {
      throw new FindQueryException(error);
    }
  }

  async findOne(id: number) {
    return this.prisma.board.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateBoardDto) {
    try {
      // 고급 트렌젝션 => 각 트렌잭션 별로 전/후 처리가 가능
      await this.prisma.$transaction(async (tx) => {
        const foundUserData = await tx.user.findUnique({ where: { id: data.userId } }); // Throws if not found
        if (!foundUserData) {
          throw new FindOneQueryException();
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (foundUserData.accountStatus === AccountStatus.ACTIVE) {
          return;
        }

        await tx.board.update({
          where: { id },
          data: { status: ContentStatus.HIDDEN },
        });
      });
    } catch (error) {
      console.error('Transaction failed. Rolled back.', error);
    }
  }

  async remove(id: number) {
    return this.prisma.board.delete({ where: { id } });
  }
}
