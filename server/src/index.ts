import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { apiRouter } from './routes/api';
import { setupWebSocketServer } from './websocket/terminalSocket';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use('/api', apiRouter);

const server = http.createServer(app);

// Initialize WebSocket Streaming Server
setupWebSocketServer(server);

server.listen(config.port, config.host, () => {
  console.log(`=======================================================`);
  console.log(`⚡ CodeSphere Cloud IDE Backend Server Running!`);
  console.log(`📡 HTTP API:      http://${config.host}:${config.port}/api`);
  console.log(`🔌 WebSocket:     ws://${config.host}:${config.port}/ws`);
  console.log(`🛡️ Sandbox Temp:  ${config.workspaceTempDir}`);
  console.log(`=======================================================`);
});
