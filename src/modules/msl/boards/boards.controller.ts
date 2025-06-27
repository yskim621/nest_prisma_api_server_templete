import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board, CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { FindQueryException } from '../../../common/commom.exception';
import { errorHandle } from '../../../common/common.error-handler';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Board, description: 'Board created successfully' })
  async create(@Body() createBoardDto: CreateBoardDto, @Req() request: Request) {
    try {
      return await this.boardsService.create(createBoardDto);
    } catch (error) {
      return await errorHandle(error, request.url, 'central-common');
    }
  }

  @Post('/bulk-contents')
  createBulk(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.createBulkContents(createBoardDto);
  }

  @Get()
  @ApiOkResponse({ type: [Board], description: 'List of all boards' })
  findAll() {
    try {
      return this.boardsService.getAllBoards();
    } catch (error) {
      console.error(error);
      throw new FindQueryException(error);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(+id, updateBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardsService.remove(+id);
  }
}
