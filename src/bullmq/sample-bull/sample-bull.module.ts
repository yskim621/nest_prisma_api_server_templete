import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SAMPLE_BULL_QUEUE } from './sample-bull.processor';
import { SampleBullProcessor } from './sample-bull.processor';
import { SampleBullService } from './sample-bull.service';
import { SampleBullController } from './sample-bull.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SAMPLE_BULL_QUEUE,
    }),
  ],
  controllers: [SampleBullController],
  providers: [SampleBullProcessor, SampleBullService],
  exports: [SampleBullService],
})
export class SampleBullModule {}
