import { Controller, Get, Post, Delete, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CORE_SERVICE, CORE_PATTERNS } from '@app/common';
import { Public } from '@app/auth';

@Controller('msl/sample-rabbit')
@ApiTags('Sample - RabbitMQ')
@ApiBearerAuth()
export class SampleRabbitProxyController {
  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientProxy) {}

  @Post('publish')
  @Public()
  @ApiOperation({ summary: 'Publish message to RabbitMQ' })
  publish(@Body() dto: { type: string; payload: any }) {
    return this.coreClient.send(CORE_PATTERNS.RABBIT_PUBLISH, dto);
  }

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Get RabbitMQ queue status' })
  getStatus() {
    return this.coreClient.send(CORE_PATTERNS.RABBIT_GET_STATUS, {});
  }

  @Delete('clear')
  @Public()
  @ApiOperation({ summary: 'Clear RabbitMQ queue' })
  clear() {
    return this.coreClient.send(CORE_PATTERNS.RABBIT_CLEAR, {});
  }
}
