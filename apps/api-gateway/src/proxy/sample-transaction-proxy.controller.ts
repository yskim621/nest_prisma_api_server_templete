import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CORE_SERVICE, CORE_PATTERNS } from '@app/common';
import { Public } from '@app/auth';

@Controller('msl/sample-transaction')
@ApiTags('Sample - Transaction')
@ApiBearerAuth()
export class SampleTransactionProxyController {
  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientProxy) {}

  @Post('create-with-check')
  @Public()
  @ApiOperation({ summary: 'Create board with user check (interactive transaction)' })
  createWithCheck(@Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.SAMPLE_TX_CREATE_WITH_CHECK, dto);
  }

  @Post('bulk-create')
  @Public()
  @ApiOperation({ summary: 'Bulk create boards (sequential transaction)' })
  bulkCreate(@Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.SAMPLE_TX_BULK_CREATE, dto);
  }

  @Post('transfer')
  @Public()
  @ApiOperation({ summary: 'Transfer board ownership (multi-step transaction)' })
  transfer(@Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.SAMPLE_TX_TRANSFER, dto);
  }

  @Get('boards')
  @Public()
  @ApiOperation({ summary: 'Get all boards (verify transaction results)' })
  getAll() {
    return this.coreClient.send(CORE_PATTERNS.SAMPLE_TX_GET_ALL, {});
  }

  @Post('strategy')
  @Public()
  @ApiOperation({ summary: 'Process boards with strategy pattern' })
  strategyProcess(@Body() dto: { userId: number; strategy: string }) {
    return this.coreClient.send(CORE_PATTERNS.SAMPLE_TX_STRATEGY_PROCESS, dto);
  }

  @Get('strategies')
  @Public()
  @ApiOperation({ summary: 'Get available processing strategies' })
  strategyList() {
    return this.coreClient.send(CORE_PATTERNS.SAMPLE_TX_STRATEGY_LIST, {});
  }
}
