import { Module } from '@nestjs/common';
import { UserModule } from './msl/user/user.module';
import { BoardsModule } from './msl/boards/boards.module';
import { MindsSignalModule } from '../routes/minds-signal.module';
import { AuthModule } from './msl/auth/auth.module';
import { UserGroupModule } from './msl/user-group/user-group.module';
import { PermissionModule } from './msl/permission/permission.module';
import { MenuModule } from './msl/menu/menu.module';

/**
 * Modules - 비즈니스 모듈을 통합 관리하는 루트 모듈
 *
 * 의존성 계층:
 * - AuthModule: 인증/인가 (UserModule 의존)
 * - UserModule: 사용자 관리 (독립)
 * - UserGroupModule: 사용자 그룹 관리
 * - PermissionModule: 권한 관리
 * - MenuModule: 메뉴 관리
 * - BoardsModule: 게시판 (UserModule 의존)
 * - MindsSignalModule: 라우팅 모듈
 */
@Module({
  imports: [AuthModule, UserModule, UserGroupModule, PermissionModule, MenuModule, BoardsModule, MindsSignalModule],
})
export class Modules {}
