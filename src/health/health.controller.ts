import { Controller, Get } from '@nestjs/common';
// NOTE: HttpHealthIndicator is deprecated in @nestjs/terminus v11.1.0 (will be removed in v12)
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { CommonResponse } from '../common/common.interface';
import { getQueryErrRes, getDefaultResponse } from '../common/common.response';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOkResponse({ type: CommonResponse })
  check() {
    const _response: CommonResponse = getDefaultResponse();
    _response.isSuccess = true;
    _response.code = '2000';
    _response.message = 'This request is processed successfully';
    _response.resSystem = 'c';
    _response.comSystem = 'aws-central';
    _response.data = null;
    return _response;
  }

  @Get('/error')
  @ApiOkResponse({ type: CommonResponse })
  checkErrorRes() {
    const _response: CommonResponse = getQueryErrRes('create');
    return _response;
  }

  @Get('/ping')
  @HealthCheck()
  pingCheck() {
    return this.health.check([() => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com')]);
  }
}
