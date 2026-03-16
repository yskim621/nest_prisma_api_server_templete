import { Injectable, NotFoundException } from '@nestjs/common';
import { Board as PrismaBoard } from '../../../../prisma/generated/nest_prisma_template';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { BoardRepository } from './board.repository';
import { UserRepository } from '../user/user.repository';
import { ContentStatus } from './board.enum';

/**
 * BoardsService - 게시판 비즈니스 로직 계층
 *
 * Repository를 통해 데이터 접근을 분리하고,
 * 사용자 검증 등 비즈니스 규칙을 이 계층에서 처리합니다.
 */
@Injectable()
export class BoardsService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * 게시글 생성 (사용자 검증 포함)
   */
  async create(createBoardDto: CreateBoardDto): Promise<PrismaBoard> {
    const foundUser = await this.userRepository.findById(createBoardDto.userId);
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

  async findAll(): Promise<PrismaBoard[]> {
    return this.boardRepository.findAll();
  }

  async findOne(id: number) {
    return this.boardRepository.findOneOrFail<PrismaBoard>(id);
  }

  async update(id: number, updateBoardDto: UpdateBoardDto): Promise<PrismaBoard> {
    await this.boardRepository.findOneOrFail(id);
    return this.boardRepository.update(id, updateBoardDto);
  }

  async remove(id: number): Promise<PrismaBoard> {
    await this.boardRepository.findOneOrFail(id);
    return this.boardRepository.remove(id);
  }

  /**
   * 상태로 게시글 목록 조회
   */
  async findByStatus(status: ContentStatus): Promise<PrismaBoard[]> {
    return this.boardRepository.findByStatus(status);
  }

  /**
   * 사용자 ID로 게시글 목록 조회
   */
  async findByUserId(userId: number): Promise<PrismaBoard[]> {
    return this.boardRepository.findByUserId(userId);
  }
}
