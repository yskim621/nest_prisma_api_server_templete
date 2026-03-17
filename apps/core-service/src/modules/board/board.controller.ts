import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CORE_PATTERNS } from '@app/common';
import { BoardService } from './board.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

@Controller()
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @MessagePattern(CORE_PATTERNS.BOARD_CREATE)
  async create(@Payload() dto: CreateBoardDto) {
    return this.boardService.create(dto);
  }

  @MessagePattern(CORE_PATTERNS.BOARD_FIND_ALL)
  async findAll() {
    return this.boardService.findAll();
  }

  @MessagePattern(CORE_PATTERNS.BOARD_FIND_BY_ID)
  async findOne(@Payload() data: { id: number }) {
    return this.boardService.findOne(data.id);
  }

  @MessagePattern(CORE_PATTERNS.BOARD_UPDATE)
  async update(@Payload() data: { id: number; dto: UpdateBoardDto }) {
    return this.boardService.update(data.id, data.dto);
  }

  @MessagePattern(CORE_PATTERNS.BOARD_DELETE)
  async remove(@Payload() data: { id: number }) {
    return this.boardService.remove(data.id);
  }

  @MessagePattern(CORE_PATTERNS.BOARD_FIND_BY_USER)
  async findByUser(@Payload() data: { userId: number }) {
    return this.boardService.findByUserId(data.userId);
  }

  @MessagePattern(CORE_PATTERNS.BOARD_BULK_CREATE)
  async bulkCreate(@Payload() data: { items: CreateBoardDto[] }) {
    return this.boardService.bulkCreate(data.items);
  }
}
