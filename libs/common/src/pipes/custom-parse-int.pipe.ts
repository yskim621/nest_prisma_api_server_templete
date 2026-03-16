import { Injectable, ParseIntPipe } from '@nestjs/common';
import { BadRequestClientException } from '../exceptions/common.exception';

@Injectable()
export class CustomParseIntPipe extends ParseIntPipe {
  constructor() {
    super({
      exceptionFactory: (error) => {
        console.error('CustomParseIntPipe Error:', error);
        throw new BadRequestClientException('central-common');
      },
    });
  }
}
