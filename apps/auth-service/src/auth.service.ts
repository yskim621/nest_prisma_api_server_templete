import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MindsaiPrismaService } from '@app/database';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload {
  sub: number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: MindsaiPrismaService,
  ) {}

  async login(dto: { email: string; password: string }): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateTokens(
    userId: number,
    email: string,
    role: string,
  ): { accessToken: string; refreshToken: string; expiresIn: string } {
    const accessPayload: TokenPayload = { sub: userId, email, role, type: 'access' };
    const refreshPayload: TokenPayload = { sub: userId, email, role, type: 'refresh' };

    return {
      accessToken: this.jwtService.sign(accessPayload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
      refreshToken: this.jwtService.sign(refreshPayload, { expiresIn: REFRESH_TOKEN_EXPIRES_IN }),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    };
  }

  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch {
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
    const payload = await this.validateToken(refreshToken);

    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessPayload: TokenPayload = { sub: payload.sub, email: payload.email, role: payload.role, type: 'access' };

    return {
      accessToken: this.jwtService.sign(accessPayload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    };
  }
}
