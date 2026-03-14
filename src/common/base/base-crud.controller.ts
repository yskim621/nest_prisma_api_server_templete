import { Get, Post, Patch, Delete, Body, Param, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BaseCrudService } from './base-crud.service';
import { BaseRepository } from './base.repository';

/**
 * BaseCrudController - 공통 CRUD 컨트롤러를 위한 추상 클래스
 *
 * @template T - 엔티티 타입
 * @template CreateDTO - 생성 DTO 타입
 * @template UpdateDTO - 수정 DTO 타입
 *
 * @example
 * ```typescript
 * @Controller('users')
 * @ApiTags('Users')
 * export class UserController extends BaseCrudController<UserDto, CreateUserDto, UpdateUserDto> {
 *   constructor(private readonly userService: UserService) {
 *     super(userService);
 *   }
 * }
 * ```
 */
export abstract class BaseCrudController<
  T,
  CreateDTO,
  UpdateDTO,
  Service extends BaseCrudService<T, CreateDTO, UpdateDTO, BaseRepository<T, CreateDTO, UpdateDTO>> = BaseCrudService<
    T,
    CreateDTO,
    UpdateDTO,
    BaseRepository<T, CreateDTO, UpdateDTO>
  >,
> {
  protected constructor(protected readonly service: Service) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '새 항목 생성' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '생성 성공' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '잘못된 요청' })
  async create(@Body() createDto: CreateDTO): Promise<T> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 항목 조회' })
  @ApiResponse({ status: HttpStatus.OK, description: '조회 성공' })
  async findAll(): Promise<T[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID로 항목 조회' })
  @ApiParam({ name: 'id', type: Number, description: '항목 ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '조회 성공' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '항목을 찾을 수 없음' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<T | null> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '항목 수정' })
  @ApiParam({ name: 'id', type: Number, description: '항목 ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '수정 성공' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '항목을 찾을 수 없음' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateDTO): Promise<T> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '항목 삭제' })
  @ApiParam({ name: 'id', type: Number, description: '항목 ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '삭제 성공' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '항목을 찾을 수 없음' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return this.service.remove(id);
  }

  @Get('exists/:id')
  @ApiOperation({ summary: '항목 존재 여부 확인' })
  @ApiParam({ name: 'id', type: Number, description: '항목 ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '확인 성공' })
  async exists(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.service.exists(id);
  }
}
