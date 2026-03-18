import { Injectable, Logger, ParseIntPipe } from '@nestjs/common';
import { BadRequestClientException } from '../exceptions/common.exception';

const logger = new Logger('CustomParseIntPipe');

@Injectable()
export class CustomParseIntPipe extends ParseIntPipe {
  constructor() {
    super({
      exceptionFactory: (error) => {
        logger.error('CustomParseIntPipe Error: ' + String(error));
        throw new BadRequestClientException('central-common');
        // throw new BadRequestClientException('central-common', new Error('Validation failed (numeric string is expected)'));
      },
    });
  }
}
