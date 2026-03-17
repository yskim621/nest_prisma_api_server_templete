import { Module } from '@nestjs/common';
import { SampleTransactionController } from './sample-transaction.controller';
import { SampleTransactionService } from './sample-transaction.service';
import { SampleStrategyTransactionService } from './sample-strategy-transaction.service';

@Module({
  controllers: [SampleTransactionController],
  providers: [SampleTransactionService, SampleStrategyTransactionService],
})
export class SampleTransactionModule {}
