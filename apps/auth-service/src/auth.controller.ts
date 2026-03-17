import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AUTH_PATTERNS, HEALTH_PATTERNS } from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(@Payload() dto: { email: string; password: string }) {
    return this.authService.login(dto);
  }

  @MessagePattern(AUTH_PATTERNS.VALIDATE_TOKEN)
  async validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(@Payload() data: { refreshToken: string }) {
    return this.authService.refreshAccessToken(data.refreshToken);
  }

  @MessagePattern(AUTH_PATTERNS.HASH_PASSWORD)
  async hashPassword(@Payload() data: { password: string }) {
    const hashed = await this.authService.hashPassword(data.password);
    return { hashedPassword: hashed };
  }

  @MessagePattern(HEALTH_PATTERNS.AUTH_PING)
  async healthPing() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
