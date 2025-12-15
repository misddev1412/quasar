import { registerAs } from '@nestjs/config';

export default registerAs('cron', () => ({
  exportJobs: {
    intervalMs: parseInt(process.env.CRON_EXPORT_INTERVAL_MS || '15000', 10),
    batchSize: parseInt(process.env.CRON_EXPORT_BATCH_SIZE || '20', 10),
    initialDelayMs: parseInt(process.env.CRON_EXPORT_INITIAL_DELAY_MS || '1000', 10),
  },
}));
