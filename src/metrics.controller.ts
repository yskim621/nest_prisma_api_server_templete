import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Registry, collectDefaultMetrics } from 'prom-client';

const registry = new Registry();
collectDefaultMetrics({ register: registry });

@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(@Res() res: Response) {
    try {
      const appMetrics = await registry.metrics();
      res.set('Content-Type', 'text/plain');
      res.send(appMetrics);
    } catch (err) {
      res.status(500).send(err instanceof Error ? err.message : String(err));
    }
  }
}
