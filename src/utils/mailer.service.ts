// import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  // constructor(private readonly mailerService: MailerService) {}

  sendWelcomeEmail(to: string) {
    return 'not module : ' + to;
    // await this.mailerService.sendMail({
    //   to,
    //   subject: '환영합니다!',
    //   template: './welcome', // 템플릿 설정 시
    //   context: {
    //     name: '사용자이름',
    //   },
    // });
  }
}
