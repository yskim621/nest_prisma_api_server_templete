import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from 'nestjs-prisma';
import { MindsaiPrismaService } from 'src/prisma/nest_template.prisma.service';
import { LoginDto } from './dto/login.dto';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: MindsaiPrismaService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    //
    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('Invalid credentials');
    // }

    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
