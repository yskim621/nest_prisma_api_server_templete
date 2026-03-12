/**
 * 샘플 트랜잭션 패턴 - DTO 정의
 *
 * 주문 처리 시스템 예제:
 * - Order (주문)
 * - OrderItem (주문 항목)
 * - Payment (결제)
 */

// ============================================
// Order DTOs
// ============================================
export interface OrderDto {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDto {
  userId: number;
  items: CreateOrderItemDto[];
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  totalAmount?: number;
}

// ============================================
// OrderItem DTOs
// ============================================
export interface OrderItemDto {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateOrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// ============================================
// Payment DTOs
// ============================================
export interface PaymentDto {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
}

export interface CreatePaymentDto {
  orderId: number;
  amount: number;
  method: PaymentMethod;
}

export interface UpdatePaymentDto {
  status?: PaymentStatus;
  transactionId?: string;
}

// ============================================
// Enums
// ============================================
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
}

// ============================================
// 트랜잭션 결과 타입
// ============================================
export interface OrderTransactionResult {
  order: OrderDto;
  items: OrderItemDto[];
  payment: PaymentDto;
}
