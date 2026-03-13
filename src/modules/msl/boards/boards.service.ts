import { Injectable, NotFoundException } from '@nestjs/common';
import { Board, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { BoardRepository } from './board.repository';
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
    const foundUser = await this.userRepository.findOne(createBoardDto.userId);
    if (!foundUser) {
      throw new NotFoundException(`User with id ${createBoardDto.userId} not found`);
    }

    return this.boardRepository.create(createBoardDto);
  }

  /**
   * 다중 게시글 생성
   */
  async createBulkContents(createBoardDto: CreateBoardDto) {
    return this.boardRepository.createMultiData(createBoardDto);
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
