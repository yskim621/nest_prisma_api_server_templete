import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { CommonResponse, getCommonResponse } from '../common/common.interface';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const _response: CommonResponse = getCommonResponse();
    _response.success = true;
    _response.message = 'success';
    _response.code = 200;
    _response.data = 'health_check_success';
    return _response;
  }

  @Get('/ping')
  @HealthCheck()
  pingCheck() {
    return this.health.check([() => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com')]);
  }
}


