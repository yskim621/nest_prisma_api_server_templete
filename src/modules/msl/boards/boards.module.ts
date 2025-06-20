import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { BoardRepository } from './board.repository';

@Module({
  controllers: [BoardsController],
  providers: [BoardRepository, BoardsService],
  exports: [BoardRepository, BoardsService],
})
export class BoardsModule {}
