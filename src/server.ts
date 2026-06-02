import { app } from './app';
import { appConfig } from './shared/config/app.config';

const server = app.listen(appConfig.port, () => {
  console.log(`Reliability backend server running on port ${appConfig.port}`);
  console.log(`Health check: http://localhost:${appConfig.port}/health`);
  console.log(`Auth API: http://localhost:${appConfig.port}${appConfig.apiPrefix}/auth`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down server...');
  server.close(() => {
    console.log('Server shutdown complete.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down server...');
  server.close(() => {
    console.log('Server shutdown complete.');
    process.exit(0);
  });
});
