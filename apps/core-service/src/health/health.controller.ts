import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HEALTH_PATTERNS } from '@app/common';

@Controller()
export class CoreHealthController {
  @MessagePattern(HEALTH_PATTERNS.CORE_PING)
  async healthPing() {
    return {
      status: 'ok',
      service: 'core-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
