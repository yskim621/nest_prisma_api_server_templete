import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from '@app/auth';
import { AUTH_SERVICE, CORE_SERVICE, HEALTH_PATTERNS } from '@app/common';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(CORE_SERVICE) private readonly coreClient: ClientProxy,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Gateway health check' })
  check() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ping')
  @Public()
  @ApiOperation({ summary: 'Simple ping' })
  ping() {
    return { pong: true, timestamp: new Date().toISOString() };
  }

  @Get('services')
  @Public()
  @ApiOperation({ summary: 'Check all microservice health' })
  async checkServices() {
    const [authHealth, coreHealth] = await Promise.all([
      firstValueFrom(
        this.authClient.send(HEALTH_PATTERNS.AUTH_PING, {}).pipe(
          timeout(3000),
          catchError(() => of({ status: 'down' })),
        ),
      ),
      firstValueFrom(
        this.coreClient.send(HEALTH_PATTERNS.CORE_PING, {}).pipe(
          timeout(3000),
          catchError(() => of({ status: 'down' })),
        ),
      ),
    ]);

    return {
      gateway: { status: 'ok', timestamp: new Date().toISOString() },
      authService: authHealth,
      coreService: coreHealth,
    };
  }
}
