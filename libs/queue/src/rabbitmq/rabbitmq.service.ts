import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: Awaited<ReturnType<typeof amqplib.connect>>;
  private channel: amqplib.Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  async onModuleInit() {
    try {
      const host = process.env.RABBITMQ_HOST || 'localhost';
      const port = process.env.RABBITMQ_PORT || '5672';
      const user = process.env.RABBITMQ_USER || 'guest';
      const password = process.env.RABBITMQ_PASSWORD || 'guest';
      const url = `amqp://${user}:${password}@${host}:${port}`;

      this.connection = await amqplib.connect(url);
      this.channel = await this.connection.createChannel();

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err.message);
      });
      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });

      this.logger.log('RabbitMQ connected');
    } catch (error) {
      this.logger.warn('RabbitMQ not available, skipping connection: ' + error.message);
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (e) {
      // ignore cleanup errors
    }
  }

  async publish(queue: string, message: any): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  }

  async consume(queue: string, callback: (msg: amqplib.ConsumeMessage) => void): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.prefetch(1);
    await this.channel.consume(queue, (msg) => {
      if (msg) {
        callback(msg);
        this.channel.ack(msg);
      }
    }, { noAck: false });
  }

  async getQueueInfo(queue: string) {
    if (!this.channel) return { messageCount: 0, consumerCount: 0 };
    const info = await this.channel.assertQueue(queue, { durable: true });
    return { messageCount: info.messageCount, consumerCount: info.consumerCount };
  }

  async purgeQueue(queue: string) {
    if (!this.channel) return;
    await this.channel.purgeQueue(queue);
  }

  isConnected(): boolean {
    return !!this.channel;
  }
}
