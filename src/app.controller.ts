import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CommonResponse, getCommonResponse } from './common/common.interface';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello(): string {
    throw new NotFoundException();
  }
  @Get('whois')
  whois(): CommonResponse {
    const _response: CommonResponse = getCommonResponse();
    _response.success = true;
    _response.message = 'success';
    _response.code = 200;
    _response.data = this.appService.whois();
    // _response.result = this.appService.whois();
    // _response.message = 'success';
    // _response.code = 200;
    // _response.httpStatus = 'OK';
    return _response;
  }

  @Get('/cache')
  async getCache(@Query('id') id: string): Promise<string> {
    const savedTime: string | null = await this.redisService.get(id);
    if (savedTime) {
      return 'saved time : ' + savedTime;
    }
    const now = new Date().getTime();
    await this.redisService.set(id, now + '', 600);
    return 'save new time : ' + now;
  }
}
