import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppLogService {
  private logsPath = process.env.LOGS_PATH || path.join(__dirname, '..', 'logs');

  constructor() {
    // 로그 디렉토리가 없는 경우 생성
    if (!fs.existsSync(this.logsPath)) {
      fs.mkdirSync(this.logsPath, { recursive: true });
    }
  }

  async writeLog(fileName: string, logText: string): Promise<void> {
    const filePath = path.join(this.logsPath, fileName);

    try {
      const seoulTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // 24시간제로 설정
      }).format(new Date());
      const logEntry = `${seoulTime} - ${logText}\n`;

      // 로그 파일에 추가 전 로그와 로그사이 라인 구분자 추가
      const logSeparator = '\n----------------------------------------\n';
      await fs.promises.appendFile(filePath, logSeparator, { flag: 'a' });

      // 로그 파일에 추가
      await fs.promises.appendFile(filePath, logEntry, 'utf8');
      console.log(`Log written to ${filePath}`);
    } catch (error) {
      console.error('Failed to write log:', error);
      throw error;
    }
  }
}
