// prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { MindsaiPrismaService } from './mindsai_platform.prisma.service';

@Global()
@Module({
  providers: [MindsaiPrismaService],
  exports: [MindsaiPrismaService],
})
export class PrismaModule {}
