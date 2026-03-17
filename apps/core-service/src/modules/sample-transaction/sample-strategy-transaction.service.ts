import { Injectable, Logger } from '@nestjs/common';
import { MindsaiPrismaService } from '@app/database';

/**
 * Strategy Pattern for Transaction Processing
 *
 * 동일한 트랜잭션 구조에 다른 비즈니스 로직을 적용하는 패턴 데모.
 * ScaleConfig로 확장 가능한 설정 기반 처리.
 */

type BoardProcessingStrategy = 'UPPERCASE' | 'PREFIX' | 'REVERSE';

interface StrategyConfig {
  name: string;
  transform: (title: string) => string;
}

@Injectable()
export class SampleStrategyTransactionService {
  private readonly logger = new Logger(SampleStrategyTransactionService.name);

  private readonly strategyMap: Record<BoardProcessingStrategy, StrategyConfig> = {
    UPPERCASE: {
      name: 'Uppercase Strategy',
      transform: (title: string) => title.toUpperCase(),
    },
    PREFIX: {
      name: 'Prefix Strategy',
      transform: (title: string) => `[PROCESSED] ${title}`,
    },
    REVERSE: {
      name: 'Reverse Strategy',
      transform: (title: string) => title.split('').reverse().join(''),
    },
  };

  constructor(private readonly prisma: MindsaiPrismaService) {}

  /**
   * Strategy 패턴으로 Board 일괄 처리
   * - 같은 트랜잭션 구조, 다른 변환 로직
   * - 새로운 Strategy 추가 시 strategyMap에 config만 추가하면 됨
   */
  async processBoards(userId: number, strategy: BoardProcessingStrategy) {
    const config = this.strategyMap[strategy];
    if (!config) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    this.logger.log(`[Strategy TX] Processing boards for user ${userId} with "${config.name}"`);

    return this.prisma.$transaction(async (tx) => {
      const boards = await tx.board.findMany({ where: { userId } });
      if (boards.length === 0) return [];

      const results = [];
      for (const board of boards) {
        const updated = await tx.board.update({
          where: { id: board.id },
          data: { title: config.transform(board.title || '') },
        });
        results.push(updated);
      }

      this.logger.log(`[Strategy TX] Processed ${results.length} boards with "${config.name}"`);
      return results;
    });
  }

  /**
   * 여러 Strategy를 순차 적용 (단일 트랜잭션)
   */
  async processMultipleStrategies(userId: number, strategies: BoardProcessingStrategy[]) {
    return this.prisma.$transaction(async (tx) => {
      let boards = await tx.board.findMany({ where: { userId } });
      const log: { strategy: string; count: number }[] = [];

      for (const strategyKey of strategies) {
        const config = this.strategyMap[strategyKey];
        if (!config) continue;

        for (const board of boards) {
          await tx.board.update({
            where: { id: board.id },
            data: { title: config.transform(board.title || '') },
          });
        }

        log.push({ strategy: config.name, count: boards.length });
        boards = await tx.board.findMany({ where: { userId } });
      }

      return { processedBoards: boards, processingLog: log };
    });
  }

  getAvailableStrategies() {
    return Object.entries(this.strategyMap).map(([key, config]) => ({
      key,
      name: config.name,
    }));
  }
}
