import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as client from 'prom-client';
import * as os from 'os';
import { Gauge, Registry } from 'prom-client';
import * as pm2 from 'pm2';

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
});

@Injectable()
export class MetricMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const startTime = Date.now();
    res.on('finish', () => {
      const responseTimeInMs = Date.now() - startTime;
      const route = req.route ? req.route.path : 'unknown_route';
      const method = req.method;
      const statusCode = res.statusCode;

      httpRequestDurationMicroseconds
        .labels(method, route, statusCode.toString())
        .observe(responseTimeInMs / 1000);
    });
    next();
  }
}

@Injectable()
export class Pm2MetricsService {
  private logger = new Logger('Pm2MetricsService');
  private prefix = 'pm2';
  private labels = [
    'id',
    'name',
    'instance',
    'version',
    'interpreter',
    'node_version',
    'hostname',
    // 'container_id',
  ];
  private map = [
    ['up', 'Is the process running'],
    ['cpu', 'Process cpu usage'],
    ['memory', 'Process memory usage'],
    ['uptime', 'Process uptime'],
    ['instances', 'Process instances'],
    ['restarts', 'Process restarts'],
    ['prev_restart_delay', 'Previous restart delay'],
  ];

  private pm2c(cmd: string, args: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof pm2[cmd] !== 'function') {
        reject(new Error(`'${cmd}' is not a valid function in pm2 module`));
        return;
      }
      pm2[cmd].apply(pm2, [
        ...args,
        (err, resp) => {
          if (err) return reject(err);
          return resolve(resp);
        },
      ]);
    });
  }

  async getMetrics(): Promise<string> {
    const pm: { [key: string]: Gauge<string> } = {};
    const registry = new Registry();
    for (const m of this.map) {
      pm[m[0]] = new Gauge({
        name: `${this.prefix}_${m[0]}`,
        help: m[1],
        labelNames: this.labels,
        registers: [registry],
      });
    }

    return this.pm2c('list')
      .then((list) => {
        for (const p of list) {
          this.logger.debug(p, p.exec_interpreter, '>>>>>>');
          const conf = {
            id: p.pm_id,
            name: p.name,
            instance: p.pm2_env.NODE_APP_INSTANCE,
            version: p.pm2_env.version ? p.pm2_env.version : 'N/A',
            interpreter: p.pm2_env.exec_interpreter,
            node_version: p.pm2_env.node_version,
            hostname: os.hostname(),
            // container_id: this.containerId,
          };

          const values = {
            up: p.pm2_env.status === 'online' ? 1 : 0,
            cpu: p.monit.cpu,
            memory: p.monit.memory,
            uptime: Math.round((Date.now() - p.pm2_env.pm_uptime) / 1000),
            instances: p.pm2_env.instances || 1,
            restarts: p.pm2_env.restart_time,
            prev_restart_delay: p.pm2_env.prev_restart_delay,
          };

          const names = Object.keys(p.pm2_env.axm_monitor);

          for (const name of names) {
            try {
              let value: unknown;
              if (name === 'Loop delay') {
                const match =
                  p.pm2_env.axm_monitor[name].value.match(/^[\d.]+/);
                value = match ? Number.parseFloat(match[0]) : NaN;
              } else if (/Event Loop Latency|Heap Size/.test(name)) {
                value = Number.parseFloat(
                  p.pm2_env.axm_monitor[name].value.toString().split('m')[0],
                );
              } else {
                value = Number.parseFloat(p.pm2_env.axm_monitor[name].value);
              }

              if (Number.isNaN(value)) {
                this.logger.warn(
                  `Ignoring metric name "${name}" as value "${value}" is not a number`,
                );
                continue;
              }

              const metricName = `${this.prefix}_${name
                .replace(/[^a-z\d]+/gi, '_')
                .toLowerCase()}`;
              if (!pm[metricName]) {
                pm[metricName] = new Gauge({
                  name: metricName,
                  help: name,
                  labelNames: this.labels,
                  registers: [registry],
                });
              }

              values[metricName] = value;
            } catch (error) {
              this.logger.error(error);
            }
          }

          for (const k of Object.keys(values)) {
            if (values[k] === null) continue;

            // Prometheus client Gauge will throw an error if we don't return a number
            // so we will skip this metrics value
            if (values[k] === undefined) continue;

            pm[k].set(conf, values[k]);
          }
        }

        return registry.metrics();
      })
      .catch((err) => {
        this.logger.error(err);
        return '';
      });
  }
}
