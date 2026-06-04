import { app } from './app';
import { appConfig } from './shared/config/app.config';
import { logger } from './shared/utils/logger';

const server = app.listen(appConfig.port, () => {
  logger.info(`Reliability backend server running on port ${appConfig.port}`);
  logger.info(`Health check: http://localhost:${appConfig.port}/health`);
  logger.info(`Auth API: http://localhost:${appConfig.port}${appConfig.apiPrefix}/auth`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down server...');
  server.close(() => {
    logger.info('Server shutdown complete.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down server...');
  server.close(() => {
    logger.info('Server shutdown complete.');
    process.exit(0);
  });
});
