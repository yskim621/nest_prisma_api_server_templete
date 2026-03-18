import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Board as PrismaBoard } from '../../../../prisma/generated/nest_prisma_template';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { FindOneQueryException } from '../../../common/exceptions/common.exception';
import { generateException } from '../../../common/exceptions/common.error-handler';
import { ContentStatus } from './board.enum';
import { AccountStatus } from '../user/user.enum';
import { BaseRepository, PrismaDelegate } from '../../../common/base';

/**
 * BoardRepository - 게시판 데이터 접근 계층
 *
 * BaseRepository로부터 findOneOrFail, findWithPagination, exists, withTransaction을 상속받고,
 * CRUD 및 도메인 쿼리는 Prisma Client를 직접 사용하여 완전한 타입 안전성을 유지합니다.
 */
@Injectable()
export class BoardRepository extends BaseRepository {
  private readonly logger = new Logger(BoardRepository.name);

  constructor(prisma: PrismaService) {
    super(prisma, 'Board');
  }

  protected get delegate(): PrismaDelegate {
    return this.prisma.board;
  }

  /**
   * 게시글 생성 (사용자 연결 포함)
   */
  async create(data: CreateBoardDto): Promise<PrismaBoard> {
    try {
      return await this.prisma.board.create({
        data: {
          title: data.title,
          description: data.description,
          status: data.status as string,
          user: { connect: { id: data.userId } },
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        generateException(error);
      }
      throw error;
    }
  }

  /**
   * 모든 게시글 조회
   */
  async findAll(): Promise<PrismaBoard[]> {
    return this.prisma.board.findMany();
  }

  /**
   * ID로 게시글 조회
   */
  async findById(id: number): Promise<PrismaBoard | null> {
    return this.prisma.board.findUnique({ where: { id } });
  }

  /**
   * 게시글 삭제
   */
  async remove(id: number): Promise<PrismaBoard> {
    return this.prisma.board.delete({ where: { id } });
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
   *
   * 사용자 계정 상태에 따라 게시글 처리 방식이 달라지는 데이터 접근 로직.
   * - ACTIVE 사용자: 현재 게시글 상태 유지
   * - 비활성 사용자: 게시글을 HIDDEN으로 변경
   */
  async update(id: number, data: UpdateBoardDto): Promise<PrismaBoard> {
    try {
      return await this.withTransaction(async (tx) => {
        const foundUserData = await tx.user.findUnique({ where: { id: data.userId } });
        if (!foundUserData) {
          throw new FindOneQueryException();
        }

        if (foundUserData.accountStatus === (AccountStatus.ACTIVE as string)) {
          const board = await tx.board.findUnique({ where: { id } });
          return board;
        }

        const updatedBoard = await tx.board.update({
          where: { id },
          data: { status: ContentStatus.HIDDEN },
        });
        return updatedBoard;
      });
    } catch (error) {
      this.logger.error('Transaction failed. Rolled back.', error);
      throw error;
    }
  }

  /**
   * 상태로 게시글 목록 조회
   */
  async findByStatus(status: ContentStatus): Promise<PrismaBoard[]> {
    return this.prisma.board.findMany({ where: { status } });
  }

  /**
   * 사용자 ID로 게시글 목록 조회
   */
  async findByUserId(userId: number): Promise<PrismaBoard[]> {
    return this.prisma.board.findMany({ where: { userId } });
  }

  /**
   * 게시글 조회 (사용자 정보 포함)
   * Prisma의 include를 직접 사용 — 이전 BaseRepository에서는 불가능했던 패턴
   */
  async findByIdWithUser(id: number) {
    return this.prisma.board.findUnique({
      where: { id },
      include: { user: true },
    });
  }
}
