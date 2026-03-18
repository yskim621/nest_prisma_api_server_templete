import { Module } from '@nestjs/common';
import { SampleTransactionController } from './sample-transaction.controller';
import { SampleTransactionService } from './sample-transaction.service';
import { SampleStrategyTransactionService } from './sample-strategy-transaction.service';
import { PrismaModule } from '../../../prisma/prisma.module';

/**
 * SampleTransactionModule - 트랜잭션 주입 패턴 샘플 모듈
 *
 * 이 모듈은 다음 패턴들의 사용 예제를 제공합니다:
 *
 * 1. 기본 트랜잭션 주입 패턴
 *    - SampleTransactionService
 *    - 여러 테이블에 걸친 트랜잭션 처리
 *
 * 2. Strategy 패턴 + 트랜잭션 주입
 *    - SampleStrategyTransactionService
 *    - switch-case 중복 제거
 *    - 확장 가능한 설정 기반 처리
 */
@Module({
  imports: [PrismaModule],
  controllers: [SampleTransactionController],
  providers: [SampleTransactionService, SampleStrategyTransactionService],
  exports: [SampleTransactionService, SampleStrategyTransactionService],
})
export class SampleTransactionModule {}
