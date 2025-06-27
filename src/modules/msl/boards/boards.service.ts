import { HttpException, Injectable } from '@nestjs/common';
import { Board, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { BoardRepository } from './board.repository';
import {
  CreateQueryException, FindOneQueryException,
  FindQueryException,
} from '../../../common/commom.exception';
import { createException, errorHandle } from '../../../common/common.error-handler';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class BoardsService {
  constructor(
    private boardRepository: BoardRepository,
    private userRepository: UserRepository,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    try {
      const foundUser = await this.userRepository.findOne(createBoardDto.userId);
      if (!foundUser) {
        throw new FindOneQueryException();
      }

      const createdBoard = await this.boardRepository.create(createBoardDto);
      if (!createdBoard) {
        throw new CreateQueryException();
      }
      return createdBoard;
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
