import { HttpException, Injectable } from '@nestjs/common';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { BoardRepository } from './board.repository';
import {
  CreateQueryException,
  FindQueryException,
  QueryException, TransactionQueryException,
  UpdateQueryException,
} from '../../../common/commom.exception';
import { createException, errorHandle } from '../../../common/common.error-handler';

@Injectable()
export class BoardsService {
  constructor(private boardRepository: BoardRepository) {}

  async create(createBoardDto: CreateBoardDto) {
    try {
      return await this.boardRepository.create(createBoardDto);
    } catch (error) {
      if (error instanceof HttpException) {
        createException(error);
      }
    }
  }

  async createBulkContents(createBoardDto: CreateBoardDto) {
    return this.boardRepository.createMultiData(createBoardDto);
  }

  async getAllBoards() {
    try {
      return this.boardRepository.findAll();
    } catch (error) {
      throw new FindQueryException(error);
    }
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
