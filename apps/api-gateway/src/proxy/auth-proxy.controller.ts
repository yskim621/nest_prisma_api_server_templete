import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AUTH_SERVICE, AUTH_PATTERNS } from '@app/common';
import { Public } from '@app/auth';

@Controller('msl/auth')
@ApiTags('Auth')
export class AuthProxyController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login' })
  login(@Body() dto: { email: string; password: string }) {
    return this.authClient.send(AUTH_PATTERNS.LOGIN, dto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: { refreshToken: string }) {
    return this.authClient.send(AUTH_PATTERNS.REFRESH_TOKEN, dto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate token' })
  validate(@Body() dto: { token: string }) {
    return this.authClient.send(AUTH_PATTERNS.VALIDATE_TOKEN, dto);
  }
}
