import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '6h' },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard, PermissionsGuard],
  exports: [JwtStrategy, JwtAuthGuard, RolesGuard, PermissionsGuard, PassportModule, JwtModule],
})
export class AuthLibModule {}
