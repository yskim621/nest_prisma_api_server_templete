import { HttpException, Injectable, Logger } from '@nestjs/common';
import { MindsaiPrismaService } from 'src/prisma/nest_template.prisma.service';
import { Board, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { FindOneQueryException } from '../../../common/exceptions/common.exception';
import { generateException } from '../../../common/exceptions/common.error-handler';
import { ContentStatus } from './board.enum';
import { AccountStatus } from '../user/user.enum';
import { BaseRepository } from '../../../common/base';

/**
 * BoardRepository - BaseRepository를 확장한 게시판 레포지토리
 *
 * 기본 CRUD 기능은 BaseRepository에서 상속받으며,
 * 게시판 도메인에 특화된 메서드만 추가로 구현합니다.
 */
@Injectable()
export class BoardRepository extends BaseRepository<Board, CreateBoardDto, UpdateBoardDto> {
  private readonly logger = new Logger(BoardRepository.name);

  constructor(prisma: MindsaiPrismaService) {
    super(prisma, 'board');
  }

  /**
   * 게시글 생성 (사용자 연결 포함)
   */
  async create(data: CreateBoardDto): Promise<Board> {
    try {
      const createdBoard = await this.prisma.board.create({
        data: {
          title: data.title,
          description: data.description,
          status: data.status as string,
          user: { connect: { id: data.userId } },
        },
      });
      return { ...createdBoard, status: createdBoard.status as ContentStatus };
    } catch (error) {
      if (error instanceof HttpException) {
        generateException(error);
      }
    }
  }

  /**
   * 다중 게시글 생성 (트랜잭션)
   */
  async createMultiData(data: CreateBoardDto) {
    return this.prisma.$transaction([
      this.prisma.board.create({
        data: { title: data.title, description: data.description, user: { connect: { id: data.userId } } },
      }),
      this.prisma.board.create({
        data: { title: data.title, description: data.description, user: { connect: { id: data.userId } } },
      }),
    ]);
  }

  /**
   * 게시글 상태 업데이트 (고급 트랜잭션)
   */
  async update(id: number, data: UpdateBoardDto): Promise<Board> {
    try {
      return await this.withTransaction(async (tx) => {
        const foundUserData = await tx.user.findUnique({ where: { id: data.userId } });
        if (!foundUserData) {
          throw new FindOneQueryException();
        }

        if (foundUserData.accountStatus === AccountStatus.ACTIVE) {
          const board = await tx.board.findUnique({ where: { id } });
          return { ...board, status: board.status as ContentStatus };
        }

        const updatedBoard = await tx.board.update({
          where: { id },
          data: { status: ContentStatus.HIDDEN },
        });
        return { ...updatedBoard, status: updatedBoard.status as ContentStatus };
      });
    } catch (error) {
      this.logger.error('Transaction failed. Rolled back.', error);
      throw error;
    }
  }

  /**
   * 상태로 게시글 목록 조회
   */
  async findByStatus(status: ContentStatus): Promise<Board[]> {
    const boards = await this.prisma.board.findMany({ where: { status } });
    return boards.map((board) => ({ ...board, status: board.status as ContentStatus }));
  }

  /**
   * 사용자 ID로 게시글 목록 조회
   */
  async findByUserId(userId: number): Promise<Board[]> {
    const boards = await this.prisma.board.findMany({ where: { userId } });
    return boards.map((board) => ({ ...board, status: board.status as ContentStatus }));
  }
}
