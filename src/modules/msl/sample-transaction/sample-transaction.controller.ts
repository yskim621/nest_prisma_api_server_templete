import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SampleTransactionService } from './sample-transaction.service';
import { SampleStrategyTransactionService, EvaluationScaleType } from './sample-strategy-transaction.service';
import { CreateOrderDto, OrderTransactionResult, PaymentMethod } from './dto/sample-transaction.dto';

@ApiTags('Sample Transaction')
@Controller('sample-transaction')
export class SampleTransactionController {
  constructor(
    private readonly sampleTransactionService: SampleTransactionService,
    private readonly sampleStrategyService: SampleStrategyTransactionService,
  ) {}

  // ============================================
  // 기본 트랜잭션 패턴 예제
  // ============================================

  @Post('order')
  @ApiOperation({
    summary: '주문 생성 (트랜잭션)',
    description: '주문, 주문항목, 결제를 하나의 트랜잭션으로 처리합니다.',
  })
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<OrderTransactionResult> {
    return this.sampleTransactionService.createOrderWithTransaction(createOrderDto);
  }

  @Delete('order/:id')
  @ApiOperation({
    summary: '주문 취소 (트랜잭션)',
    description: '주문 취소 및 결제 환불을 하나의 트랜잭션으로 처리합니다.',
  })
  async cancelOrder(@Param('id') id: number): Promise<OrderTransactionResult> {
    return this.sampleTransactionService.cancelOrderWithTransaction(id);
  }

  // ============================================
  // Strategy 패턴 + 트랜잭션 예제
  // ============================================

  @Post('evaluation/:evaluationId/scale/:scale')
  @ApiOperation({
    summary: '평가 결과 업데이트 (Strategy 패턴)',
    description: 'Strategy 패턴을 사용하여 여러 스케일 타입을 처리합니다.',
  })
  async updateEvaluationResult(
    @Param('evaluationId') evaluationId: string,
    @Param('scale') scale: EvaluationScaleType,
    @Body() body: { selectedItems: number[] },
  ): Promise<void> {
    // 외부에서 트랜잭션을 시작하고 서비스에 주입
    return this.sampleStrategyService.updateMultipleScales(evaluationId, [{ scale, selectedItems: body.selectedItems }]);
  }

  @Post('evaluation/:evaluationId/batch')
  @ApiOperation({
    summary: '다중 스케일 일괄 업데이트 (트랜잭션)',
    description: '여러 스케일의 결과를 하나의 트랜잭션으로 처리합니다.',
  })
  async updateMultipleScales(
    @Param('evaluationId') evaluationId: string,
    @Body() body: { scales: Array<{ scale: EvaluationScaleType; selectedItems: number[] }> },
  ): Promise<void> {
    return this.sampleStrategyService.updateMultipleScales(evaluationId, body.scales);
  }

  // ============================================
  // 테스트용 엔드포인트
  // ============================================

  @Post('test/order')
  @ApiOperation({
    summary: '테스트 주문 생성',
    description: '테스트용 샘플 주문을 생성합니다.',
  })
  async createTestOrder(): Promise<OrderTransactionResult> {
    const testOrder: CreateOrderDto = {
      userId: 1,
      items: [
        { productId: 101, productName: '테스트 상품 A', quantity: 2, unitPrice: 10000 },
        { productId: 102, productName: '테스트 상품 B', quantity: 1, unitPrice: 25000 },
      ],
      paymentMethod: PaymentMethod.CREDIT_CARD,
    };

    return this.sampleTransactionService.createOrderWithTransaction(testOrder);
  }
}
