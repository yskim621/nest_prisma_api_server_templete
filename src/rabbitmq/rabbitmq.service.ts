import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { connect, Channel, ChannelModel, Replies, ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel;
  private channel: Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect(): Promise<void> {
    try {
      const host = process.env.RABBITMQ_HOST || 'localhost';
      const port = process.env.RABBITMQ_PORT || '5672';
      const user = process.env.RABBITMQ_USER || 'guest';
      const password = process.env.RABBITMQ_PASSWORD || 'guest';

      const url = `amqp://${user}:${password}@${host}:${port}`;
      this.connection = await connect(url);
      this.channel = await this.connection.createChannel();

      this.logger.log('RabbitMQ connected');

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err.message);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to connect to RabbitMQ:', errorMessage);
      throw error;
    }
  }

  private async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Error closing RabbitMQ connection:', errorMessage);
    }
  }

  /**
   * 큐에 메시지 발행 (Producer)
   */
  async publish(queue: string, message: object): Promise<boolean> {
    try {
      await this.channel.assertQueue(queue, { durable: true });

      const messageBuffer = Buffer.from(JSON.stringify(message));
      const result = this.channel.sendToQueue(queue, messageBuffer, {
        persistent: true,
      });

      this.logger.debug(`Message published to queue "${queue}": ${JSON.stringify(message)}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to publish message to queue "${queue}":`, errorMessage);
      throw error;
    }
  }

  /*
   * 큐 메시지 소비 (Consumer)
   */
  async consume(queue: string, callback: (message: object) => Promise<void>): Promise<void> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.prefetch(1);

      this.logger.log(`Waiting for messages in queue "${queue}"...`);

      await this.channel.consume(
        queue,
        (msg: ConsumeMessage | null) => {
          if (msg) {
            void this.processMessage(msg, queue, callback);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to consume messages from queue "${queue}":`, errorMessage);
      throw error;
    }
  }

  /**
   * 메시지 처리 (내부 헬퍼)
   */
  private async processMessage(
    msg: ConsumeMessage,
    queue: string,
    callback: (message: object) => Promise<void>,
  ): Promise<void> {
    try {
      const content = JSON.parse(msg.content.toString()) as object;
      this.logger.debug(`Message received from queue "${queue}": ${JSON.stringify(content)}`);

      await callback(content);

      this.channel.ack(msg);
      this.logger.debug(`Message acknowledged`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing message:`, errorMessage);
      this.channel.nack(msg, false, true);
    }
  }

  /**
   * 큐 정보 조회
   */
  async getQueueInfo(queue: string): Promise<Replies.AssertQueue> {
    return this.channel.assertQueue(queue, { durable: true });
  }

  /**
   * 큐 삭제
   */
  async deleteQueue(queue: string): Promise<Replies.DeleteQueue> {
    return this.channel.deleteQueue(queue);
  }

  /**
   * 큐 비우기
   */
  async purgeQueue(queue: string): Promise<Replies.PurgeQueue> {
    return this.channel.purgeQueue(queue);
  }
}
