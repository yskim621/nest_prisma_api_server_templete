import { Injectable } from '@nestjs/common';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { BoardRepository } from './board.repository';

@Injectable()
export class BoardsService {
  constructor(private boardRepository: BoardRepository) {}

  async create(createBoardDto: CreateBoardDto) {
    return this.boardRepository.create(createBoardDto);
  }

  async createBulkContents(createBoardDto: CreateBoardDto) {
    return this.boardRepository.createMultiData(createBoardDto);
  }

  async getAllBoards() {
    return this.boardRepository.findAll();
  }

  async findOne(id: number) {
    return this.boardRepository.findOne(id);
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.update(id, updateBoardDto);
  }

  async remove(id: number) {
    return this.boardRepository.remove(id);
  }
}
