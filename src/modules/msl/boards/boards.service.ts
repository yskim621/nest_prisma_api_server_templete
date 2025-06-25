import { Injectable } from '@nestjs/common';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { BoardRepository } from './board.repository';
import { QueryException } from '../../../common/commom.exception';

@Injectable()
export class BoardsService {
  constructor(private boardRepository: BoardRepository) {}

  async create(createBoardDto: CreateBoardDto) {
    try {
      return await this.boardRepository.create(createBoardDto);
    } catch (error) {
      throw new QueryException('create', error);
    }
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
