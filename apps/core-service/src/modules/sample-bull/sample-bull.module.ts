import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SampleBullController } from './sample-bull.controller';
import { SampleBullService } from './sample-bull.service';
import { SampleBullProcessor, SAMPLE_BULL_QUEUE } from './sample-bull.processor';

@Module({
  imports: [BullModule.registerQueue({ name: SAMPLE_BULL_QUEUE })],
  controllers: [SampleBullController],
  providers: [SampleBullService, SampleBullProcessor],
})
export class SampleBullModule {}
