import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  whois(): string {
    return process.env.WHOIS;
  }
}
