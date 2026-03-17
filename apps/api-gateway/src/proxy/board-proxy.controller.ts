import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CORE_SERVICE, CORE_PATTERNS } from '@app/common';

@Controller('msl/boards')
@ApiTags('Boards')
@ApiBearerAuth()
export class BoardsProxyController {
  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Create board' })
  create(@Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.BOARD_CREATE, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create boards' })
  bulkCreate(@Body() dto: { items: any[] }) {
    return this.coreClient.send(CORE_PATTERNS.BOARD_BULK_CREATE, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards' })
  findAll() {
    return this.coreClient.send(CORE_PATTERNS.BOARD_FIND_ALL, {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.BOARD_FIND_BY_ID, { id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update board' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.coreClient.send(CORE_PATTERNS.BOARD_UPDATE, { id, dto });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete board' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coreClient.send(CORE_PATTERNS.BOARD_DELETE, { id });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get boards by user' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.coreClient.send(CORE_PATTERNS.BOARD_FIND_BY_USER, { userId });
  }
}
