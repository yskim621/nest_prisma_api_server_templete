import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { Board, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';

@Controller('boards')
@ApiTags('Boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '게시글 생성' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '게시글 생성 성공', type: Board })
  async create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '다중 게시글 생성' })
  createBulk(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.createBulkContents(createBoardDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 게시글 조회' })
  @ApiOkResponse({ type: [Board], description: '게시글 목록' })
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID로 게시글 조회' })
  @ApiResponse({ status: HttpStatus.OK, description: '조회 성공', type: Board })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiResponse({ status: HttpStatus.OK, description: '수정 성공', type: Board })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(id, updateBoardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiResponse({ status: HttpStatus.OK, description: '삭제 성공', type: Board })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.remove(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '사용자별 게시글 조회' })
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.boardsService.findByUserId(userId);
  }
}
