import { Global, Module } from '@nestjs/common';
import { AppLogService } from './applog.service';
import { FirebaseService } from './firebase.service';
import { EmailService } from './mailer.service';
import { LoggerFactory, LoggingService } from './logger';

@Global()
@Module({
  providers: [AppLogService, FirebaseService, EmailService, LoggerFactory, LoggingService],
  exports: [AppLogService, FirebaseService, EmailService, LoggerFactory, LoggingService],
})
export class UtilsModule {}
