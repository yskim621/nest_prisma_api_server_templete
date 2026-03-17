import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardRepository } from './board.repository';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async create(dto: CreateBoardDto) {
    return this.boardRepository.create(dto);
  }

  async findAll() {
    return this.boardRepository.findAll();
  }

  async findOne(id: number) {
    return this.boardRepository.findOneOrFail(id);
  }

  async update(id: number, dto: UpdateBoardDto) {
    await this.boardRepository.findOneOrFail(id);
    return this.boardRepository.update(id, dto);
  }

  async remove(id: number) {
    await this.boardRepository.findOneOrFail(id);
    return this.boardRepository.remove(id);
  }

  async findByUserId(userId: number) {
    return this.boardRepository.findByUserId(userId);
  }

  async bulkCreate(items: CreateBoardDto[]) {
    return this.boardRepository.bulkCreate(items);
  }
}
