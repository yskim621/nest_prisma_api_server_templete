import { PrismaClient } from '../../../prisma/generated/nest_prisma_template/client';

/**
 * Prisma 트랜잭션 클라이언트 타입
 *
 * 트랜잭션 내에서 사용할 수 없는 메서드들을 제외한 타입
 */
export type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * 트랜잭션 콜백 함수 타입
 */
export type TransactionCallback<T> = (tx: TransactionClient) => Promise<T>;

/**
 * 트랜잭션 옵션
 */
export interface TransactionOptions {
  maxWait?: number; // 최대 대기 시간 (ms)
  timeout?: number; // 트랜잭션 타임아웃 (ms)
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
}
