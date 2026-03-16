import { Global, Module } from '@nestjs/common';
import { MindsaiPrismaService } from './nest_template.prisma.service';

@Global()
@Module({
  providers: [MindsaiPrismaService],
  exports: [MindsaiPrismaService],
})
export class PrismaModule {}
