import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ description: 'Job name (email, notification, data-processing)' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Job data', required: false })
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({ description: 'Delay in milliseconds', required: false })
  @IsOptional()
  @IsNumber()
  delay?: number;

  @ApiProperty({ description: 'Job priority (lower = higher priority)', required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;
}
