import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionClient } from '../../../common/base/transaction.types';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  OrderDto,
  OrderItemDto,
  OrderStatus,
  OrderTransactionResult,
  PaymentDto,
  PaymentMethod,
  PaymentStatus,
} from './dto/sample-transaction.dto';

/**
 * SampleTransactionService - 트랜잭션 주입 패턴 샘플
 *
 * 이 서비스는 여러 테이블에 걸친 복잡한 트랜잭션을 처리하는 방법을 보여줍니다.
 *
 * 패턴 특징:
 * 1. 트랜잭션 클라이언트(tx)를 파라미터로 받아 여러 작업을 하나의 트랜잭션으로 묶음
 * 2. 각 하위 메서드도 tx를 받아 동일한 트랜잭션 컨텍스트에서 실행
 * 3. 어느 단계에서든 실패하면 전체 롤백
 */
@Injectable()
export class SampleTransactionService {
  private readonly logger = new Logger(SampleTransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // 메인 트랜잭션 메서드
  // ============================================

  /**
   * 주문 생성 - 여러 테이블을 하나의 트랜잭션으로 처리
   *
   * 트랜잭션 순서:
   * 1. 주문(Order) 생성
   * 2. 주문 항목(OrderItem) 생성
   * 3. 결제(Payment) 생성
   * 4. 재고 차감 (선택적)
   *
   * 어느 단계에서든 실패하면 전체 롤백됨
   */
  async createOrderWithTransaction(createOrderDto: CreateOrderDto): Promise<OrderTransactionResult> {
    return this.prisma.$transaction(async (tx: TransactionClient) => {
      this.logger.log('트랜잭션 시작: 주문 생성');

      // 1. 총 금액 계산
      const totalAmount = this.calculateTotalAmount(createOrderDto.items);

      // 2. 주문 생성 (tx 주입)
      const order = await this.createOrder(tx, {
        userId: createOrderDto.userId,
        totalAmount,
      });

      // 3. 주문 항목 생성 (tx 주입)
      const items = await this.createOrderItems(tx, order.id, createOrderDto.items);

      // 4. 결제 생성 (tx 주입)
      const payment = await this.createPayment(tx, {
        orderId: order.id,
        amount: totalAmount,
        method: createOrderDto.paymentMethod,
      });

      // 5. 주문 상태 업데이트 (tx 주입)
      const confirmedOrder = await this.updateOrderStatus(tx, order.id, OrderStatus.CONFIRMED);

      this.logger.log(`트랜잭션 완료: 주문 ID ${order.id}`);

      return {
        order: confirmedOrder,
        items,
        payment,
      };
    });
  }

  /**
   * 주문 취소 - 여러 테이블을 하나의 트랜잭션으로 처리
   */
  async cancelOrderWithTransaction(orderId: number): Promise<OrderTransactionResult> {
    return this.prisma.$transaction(async (tx: TransactionClient) => {
      this.logger.log(`트랜잭션 시작: 주문 취소 (ID: ${orderId})`);

      // 1. 주문 조회
      const order = await this.findOrderById(tx, orderId);
      if (!order) {
        throw new Error(`주문을 찾을 수 없습니다: ${orderId}`);
      }

      // 2. 결제 환불 처리 (tx 주입)
      const payment = await this.refundPayment(tx, orderId);

      // 3. 주문 상태 변경 (tx 주입)
      const cancelledOrder = await this.updateOrderStatus(tx, orderId, OrderStatus.CANCELLED);

      // 4. 주문 항목 조회
      const items = await this.findOrderItems(tx, orderId);

      this.logger.log(`트랜잭션 완료: 주문 취소 (ID: ${orderId})`);

      return {
        order: cancelledOrder,
        items,
        payment,
      };
    });
  }

  // ============================================
  // 트랜잭션 주입을 받는 하위 메서드들
  // ============================================

  /**
   * 주문 생성 (트랜잭션 주입)
   *
   * @param tx - 트랜잭션 클라이언트
   * @param data - 주문 데이터
   */
  private createOrder(_tx: TransactionClient, data: { userId: number; totalAmount: number }): Promise<OrderDto> {
    // 실제 구현에서는 _tx.order.create() 사용
    // 샘플이므로 모의 데이터 반환
    const order: OrderDto = {
      id: Math.floor(Math.random() * 10000),
      userId: data.userId,
      status: OrderStatus.PENDING,
      totalAmount: data.totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.debug(`주문 생성됨: ${order.id}`);
    return Promise.resolve(order);

    // 실제 Prisma 사용 예:
    // return _tx.order.create({
    //   data: {
    //     userId: data.userId,
    //     status: OrderStatus.PENDING,
    //     totalAmount: data.totalAmount,
    //   },
    // });
  }

  /**
   * 주문 항목 생성 (트랜잭션 주입)
   */
  private createOrderItems(_tx: TransactionClient, orderId: number, items: CreateOrderItemDto[]): Promise<OrderItemDto[]> {
    const createdItems: OrderItemDto[] = items.map((item, index) => ({
      id: Math.floor(Math.random() * 10000) + index,
      orderId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));

    this.logger.debug(`주문 항목 ${createdItems.length}개 생성됨`);
    return Promise.resolve(createdItems);

    // 실제 Prisma 사용 예:
    // return _tx.orderItem.createMany({
    //   data: items.map(item => ({
    //     orderId,
    //     productId: item.productId,
    //     productName: item.productName,
    //     quantity: item.quantity,
    //     unitPrice: item.unitPrice,
    //     subtotal: item.quantity * item.unitPrice,
    //   })),
    // });
  }

  /**
   * 결제 생성 (트랜잭션 주입)
   */
  private createPayment(_tx: TransactionClient, data: { orderId: number; amount: number; method: PaymentMethod }): Promise<PaymentDto> {
    const payment: PaymentDto = {
      id: Math.floor(Math.random() * 10000),
      orderId: data.orderId,
      amount: data.amount,
      method: data.method,
      status: PaymentStatus.COMPLETED,
      transactionId: `TXN-${Date.now()}`,
      createdAt: new Date(),
    };

    this.logger.debug(`결제 생성됨: ${payment.id}`);
    return Promise.resolve(payment);

    // 실제 Prisma 사용 예:
    // return _tx.payment.create({
    //   data: {
    //     orderId: data.orderId,
    //     amount: data.amount,
    //     method: data.method,
    //     status: PaymentStatus.PENDING,
    //   },
    // });
  }

  /**
   * 주문 상태 업데이트 (트랜잭션 주입)
   */
  private updateOrderStatus(_tx: TransactionClient, orderId: number, status: OrderStatus): Promise<OrderDto> {
    this.logger.debug(`주문 상태 변경: ${orderId} -> ${status}`);

    // 모의 데이터 반환
    return Promise.resolve({
      id: orderId,
      userId: 1,
      status,
      totalAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 실제 Prisma 사용 예:
    // return _tx.order.update({
    //   where: { id: orderId },
    //   data: { status, updatedAt: new Date() },
    // });
  }

  /**
   * 주문 조회 (트랜잭션 주입)
   */
  private findOrderById(_tx: TransactionClient, orderId: number): Promise<OrderDto | null> {
    // 실제 Prisma 사용 예:
    // return _tx.order.findUnique({ where: { id: orderId } });

    return Promise.resolve({
      id: orderId,
      userId: 1,
      status: OrderStatus.CONFIRMED,
      totalAmount: 10000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 주문 항목 조회 (트랜잭션 주입)
   */
  private findOrderItems(_tx: TransactionClient, _orderId: number): Promise<OrderItemDto[]> {
    // 실제 Prisma 사용 예:
    // return _tx.orderItem.findMany({ where: { orderId: _orderId } });

    return Promise.resolve([] as OrderItemDto[]);
  }

  /**
   * 결제 환불 (트랜잭션 주입)
   */
  private refundPayment(_tx: TransactionClient, orderId: number): Promise<PaymentDto> {
    this.logger.debug(`결제 환불 처리: 주문 ID ${orderId}`);

    // 실제 Prisma 사용 예:
    // return _tx.payment.update({
    //   where: { orderId },
    //   data: { status: PaymentStatus.REFUNDED },
    // });

    return Promise.resolve({
      id: 1,
      orderId,
      amount: 10000,
      method: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.REFUNDED,
      createdAt: new Date(),
    });
  }

  // ============================================
  // 유틸리티 메서드
  // ============================================

  private calculateTotalAmount(items: CreateOrderItemDto[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }
}
