import { PrismaClient } from 'prisma/generated/nest_prisma_template';

export type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;
export type TransactionCallback<T> = (tx: TransactionClient) => Promise<T>;
export interface TransactionOptions {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
}
