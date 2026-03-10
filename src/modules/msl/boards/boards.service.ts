import { HttpException, Injectable } from '@nestjs/common';
import { Board, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { BoardRepository } from './board.repository';
import { CreateQueryException, FindOneQueryException } from '../../../common/exceptions/common.exception';
import { generateException } from '../../../common/exceptions/common.error-handler';
import { UserRepository } from '../user/user.repository';
import { BaseCrudService } from '../../../common/base';
import { ContentStatus } from './board.enum';

/**
 * BoardsService - BaseCrudService를 확장한 게시판 서비스
 *
 * 기본 CRUD 기능은 BaseCrudService에서 상속받으며,
 * 게시판 도메인에 특화된 비즈니스 로직만 추가로 구현합니다.
 */
@Injectable()
export class BoardsService extends BaseCrudService<Board, CreateBoardDto, UpdateBoardDto, BoardRepository> {
  constructor(
    private boardRepository: BoardRepository,
    private userRepository: UserRepository,
  ) {
    super(boardRepository);
  }

  /**
   * 게시글 생성 (사용자 검증 포함)
   */
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
        generateException(error);
      }
    }
  }

  /**
   * 다중 게시글 생성
   */
  async createBulkContents(createBoardDto: CreateBoardDto) {
    return this.boardRepository.createMultiData(createBoardDto);
  }

  /**
   * 모든 게시글 조회
   * @deprecated findAll() 사용 권장
   */
  async getAllBoards() {
    return this.findAll();
  }

  /**
   * 상태로 게시글 목록 조회
   */
  async findByStatus(status: ContentStatus): Promise<Board[]> {
    return this.boardRepository.findByStatus(status);
  }

  /**
   * 사용자 ID로 게시글 목록 조회
   */
  async findByUserId(userId: number): Promise<Board[]> {
    return this.boardRepository.findByUserId(userId);
  }
}
