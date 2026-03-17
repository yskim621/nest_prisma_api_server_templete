import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CORE_PATTERNS } from '@app/common';
import { SampleTransactionService } from './sample-transaction.service';
import { SampleStrategyTransactionService } from './sample-strategy-transaction.service';
import {
  CreateBoardWithUserCheckDto,
  BulkBoardTransactionDto,
  TransferBoardDto,
} from './dto/sample-transaction.dto';

@Controller()
export class SampleTransactionController {
  constructor(
    private readonly txService: SampleTransactionService,
    private readonly strategyService: SampleStrategyTransactionService,
  ) {}

  @MessagePattern(CORE_PATTERNS.SAMPLE_TX_CREATE_WITH_CHECK)
  async createWithCheck(@Payload() dto: CreateBoardWithUserCheckDto) {
    return this.txService.createBoardWithUserCheck(dto);
  }

  @MessagePattern(CORE_PATTERNS.SAMPLE_TX_BULK_CREATE)
  async bulkCreate(@Payload() dto: BulkBoardTransactionDto) {
    return this.txService.bulkCreateBoards(dto);
  }

  @MessagePattern(CORE_PATTERNS.SAMPLE_TX_TRANSFER)
  async transfer(@Payload() dto: TransferBoardDto) {
    return this.txService.transferBoard(dto);
  }

  @MessagePattern(CORE_PATTERNS.SAMPLE_TX_GET_ALL)
  async getAll() {
    return this.txService.getAllBoards();
  }

  @MessagePattern(CORE_PATTERNS.SAMPLE_TX_STRATEGY_PROCESS)
  async strategyProcess(@Payload() data: { userId: number; strategy: string }) {
    return this.strategyService.processBoards(data.userId, data.strategy as 'UPPERCASE' | 'PREFIX' | 'REVERSE');
  }

  @MessagePattern(CORE_PATTERNS.SAMPLE_TX_STRATEGY_LIST)
  async strategyList() {
    return this.strategyService.getAvailableStrategies();
  }
}
