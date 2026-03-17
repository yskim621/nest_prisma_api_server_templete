import { Module } from '@nestjs/common';
import { SampleQueueController } from './sample-queue.controller';
import { SampleQueueService } from './sample-queue.service';
import { SampleQueueConsumer } from './sample-queue.consumer';

@Module({
  controllers: [SampleQueueController],
  providers: [SampleQueueService, SampleQueueConsumer],
})
export class SampleQueueModule {}
