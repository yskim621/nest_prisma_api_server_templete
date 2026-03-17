import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { MindsaiPrismaService } from '@app/database';
import {
  CreateBoardWithUserCheckDto,
  BulkBoardTransactionDto,
  TransferBoardDto,
} from './dto/sample-transaction.dto';

/**
 * Sample Transaction Service
 *
 * Prisma $transaction() 패턴 데모:
 * 1. Interactive Transaction: callback 기반 (tx 객체 전달)
 * 2. Sequential Transaction: 쿼리 배열 기반
 * 3. Multi-step validation + rollback 패턴
 */
@Injectable()
export class SampleTransactionService {
  private readonly logger = new Logger(SampleTransactionService.name);

  constructor(private readonly prisma: MindsaiPrismaService) {}

  /**
   * Pattern 1: Interactive Transaction
   * User 존재 확인 → Board 생성 → 로그 기록 (원자적)
   */
  async createBoardWithUserCheck(dto: CreateBoardWithUserCheckDto) {
    return this.prisma.$transaction(async (tx) => {
      this.logger.log(`[TX] Step 1: Checking user ${dto.userId}`);
      const user = await tx.user.findUnique({ where: { id: dto.userId } });
      if (!user) {
        throw new NotFoundException(`User ${dto.userId} not found`);
      }
      if (user.accountStatus !== 'ACTIVE') {
        throw new BadRequestException(`User ${dto.userId} is not active`);
      }

      this.logger.log('[TX] Step 2: Creating board');
      const board = await tx.board.create({
        data: {
          title: dto.title,
          description: dto.description,
          status: 'POSTED',
          userId: dto.userId,
        },
      });

      this.logger.log(`[TX] Step 3: Board created with id ${board.id}`);
      return { user: { id: user.id, email: user.email, name: user.name }, board };
    });
  }

  /**
   * Pattern 2: Sequential Transaction (배열 기반)
   * 여러 Board를 한 번에 생성 (all or nothing)
   */
  async bulkCreateBoards(dto: BulkBoardTransactionDto) {
    const queries = dto.titles.map((title) =>
      this.prisma.board.create({
        data: {
          title,
          description: `Bulk created for user ${dto.userId}`,
          status: 'POSTED',
          userId: dto.userId,
        },
      }),
    );

    this.logger.log(`[TX] Bulk creating ${dto.titles.length} boards`);
    const results = await this.prisma.$transaction(queries);
    this.logger.log(`[TX] Bulk creation completed: ${results.length} boards`);
    return results;
  }

  /**
   * Pattern 3: Multi-step Interactive Transaction
   * Board 소유권 이전: fromUser 확인 → toUser 확인 → Board 확인 → 이전
   */
  async transferBoard(dto: TransferBoardDto) {
    return this.prisma.$transaction(async (tx) => {
      this.logger.log(`[TX] Transfer board ${dto.boardId}: user ${dto.fromUserId} -> ${dto.toUserId}`);

      const fromUser = await tx.user.findUnique({ where: { id: dto.fromUserId } });
      if (!fromUser) throw new NotFoundException(`Source user ${dto.fromUserId} not found`);

      const toUser = await tx.user.findUnique({ where: { id: dto.toUserId } });
      if (!toUser) throw new NotFoundException(`Target user ${dto.toUserId} not found`);

      const board = await tx.board.findUnique({ where: { id: dto.boardId } });
      if (!board) throw new NotFoundException(`Board ${dto.boardId} not found`);
      if (board.userId !== dto.fromUserId) {
        throw new BadRequestException(`Board ${dto.boardId} does not belong to user ${dto.fromUserId}`);
      }

      const updated = await tx.board.update({
        where: { id: dto.boardId },
        data: { userId: dto.toUserId },
        include: { user: { select: { id: true, email: true, name: true } } },
      });

      this.logger.log(`[TX] Transfer completed`);
      return { from: { id: fromUser.id, email: fromUser.email }, to: { id: toUser.id, email: toUser.email }, board: updated };
    });
  }

  /**
   * 전체 Board 목록 (트랜잭션 결과 확인용)
   */
  async getAllBoards() {
    return this.prisma.board.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { id: 'desc' },
    });
  }
}
