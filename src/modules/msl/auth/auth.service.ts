import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MindsaiPrismaService } from 'src/prisma/nest_template.prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from 'src/environment';

export interface TokenPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: number;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: MindsaiPrismaService,
  ) {}

  /**
   * 사용자 로그인
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
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

    const tokens = this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  /**
   * 비밀번호 해싱
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * 비밀번호 검증
   */
  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Access/Refresh 토큰 생성
   */
  private generateTokens(userId: number, email: string): { accessToken: string; refreshToken: string; expiresIn: string } {
    const accessPayload: TokenPayload = { sub: userId, email, type: 'access' };
    const refreshPayload: TokenPayload = { sub: userId, email, type: 'refresh' };

    return {
      accessToken: this.jwtService.sign(accessPayload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
      refreshToken: this.jwtService.sign(refreshPayload, { expiresIn: REFRESH_TOKEN_EXPIRES_IN }),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    };
  }

  /**
   * 토큰 검증
   */
  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch {
      return null;
    }
  }

  /**
   * Refresh 토큰으로 새 Access 토큰 발급
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
    const payload = await this.validateToken(refreshToken);

    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessPayload: TokenPayload = { sub: payload.sub, email: payload.email, type: 'access' };

    return {
      accessToken: this.jwtService.sign(accessPayload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    };
  }
}
