// src/utils/utils.module.ts
import { Global, Module } from '@nestjs/common';
import { AppLogService } from './applog.service';
import { FirebaseService } from './firebase.service';
/**
 * html-minifier  *
 * 2025-05-07 보안이슈로 관련 라이브러리 삭제
Severity: high
kangax html-minifier REDoS vulnerability - https://github.com/advisories/GHSA-pfq8-rq6v-vf5m 
Will install @nestjs-modules/mailer@1.6.1, which is a breaking change
npm uninstall @nestjs-modules/mailer
npm uninstall @types/nodemailer
npm uninstall nodemailer 
*/
// import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './mailer.service';

@Global()
@Module({
  // imports: [
  //   MailerModule.forRoot({
  //     transport: {
  //       host: process.env.MAIL_HOST,
  //       port: parseInt(process.env.MAIL_PORT, 10),
  //       secure: false,
  //       auth: {
  //         user: process.env.MAIL_USERNAME,
  //         pass: process.env.MAIL_PASSWORD,
  //       },
  //     },
  //     defaults: {
  //       from: '"Doraemon" <noreply@mindsai.co.kr>',
  //     },
  //   }),
  // ],
  providers: [AppLogService, FirebaseService, EmailService],
  exports: [AppLogService, FirebaseService, EmailService],
})
export class UtilsModule {}
