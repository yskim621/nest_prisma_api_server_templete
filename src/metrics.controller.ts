import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Registry, collectDefaultMetrics } from 'prom-client';
import { Pm2MetricsService } from './middlewares/metric.middleware';
const client = new Registry();
collectDefaultMetrics({ register: client });

@Controller('metrics')
export class MetricsController {
  constructor(private pm2MetricsService: Pm2MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    try {
      // 애플리케이션 메트릭을 가져옵니다.
      const appMetrics = await client.metrics();
      // PM2 메트릭을 가져옵니다.
      // const pm2Metrics = await this.pm2MetricsService.getMetrics();
      // // 애플리케이션 메트릭과 PM2 메트릭을 결합합니다.
      // const combinedMetrics = appMetrics + '\n' + pm2Metrics;

      // 결합한 메트릭을 응답으로 반환합니다.
      res.set('Content-Type', 'text/plain');
      res.send(appMetrics);
    } catch (err) {
      res.status(500).send(err instanceof Error ? err.message : String(err));
    }
  }
}
