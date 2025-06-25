import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { CommonResponse } from '../../../common/common.interface';
import { getDefaultResponse, getQueryErrRes } from '../../../common/common.response';
import { ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateQueryException, FindQueryException } from '../../../common/commom.exception';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post('/create')
  @ApiOkResponse({ type: CommonResponse, description: 'Board created successfully' })
  async create(@Body() createBoardDto: CreateBoardDto, @Res() res: Response): Promise<void> {
    try {
      const createdBoard = await this.boardsService.create(createBoardDto);
      const _response: CommonResponse = getDefaultResponse();
      _response.data = { board: createdBoard };

      res.status(HttpStatus.OK).json(_response);
    } catch (error) {
      const createQueryException = new CreateQueryException(error);
      const response = createQueryException.getResponse();
      res.status(HttpStatus.OK).json(response);
      // const queryErrRes = getQueryErrRes('create');
      // res.status(HttpStatus.OK).json(queryErrRes);
    }
  }

  @Post('/bulk-contents')
  createBulk(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.createBulkContents(createBoardDto);
  }

  @Get()
  @ApiOkResponse({ type: [CreateBoardDto], description: 'List of all boards' })
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
