require('dotenv').config();
const http = require('node:http');
const app = require('./app');
const { allowedOrigins } = require('./src/config/origins');
const { createSocketServer } = require('./src/realtime/socket-server');

function createRuntime(application = app, origins = allowedOrigins) {
  const server = http.createServer(application);
  const io = createSocketServer(server, origins);
  application.set('io', io);
  return { server, io };
}

if (require.main === module) {
  const { server, io } = createRuntime();
  const port = Number(process.env.PORT || 3000);

  server.listen(port, () => {
    console.log(`Servidor HTTP e WebSocket rodando na porta ${port}`);
    console.log(`Documentação disponível em: http://localhost:${port}/docs`);
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Encerrando servidor (${signal})...`);
    io.close(() => {
      console.log('Conexões HTTP e WebSocket encerradas.');
      process.exitCode = 0;
    });
  };

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.once(signal, () => shutdown(signal));
  }
}

module.exports = { createRuntime };
