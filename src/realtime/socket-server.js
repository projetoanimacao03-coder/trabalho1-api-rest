const { Server } = require('socket.io');
const { allowedOrigins } = require('../config/origins');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isEmptyPayload(payload) {
  return payload === undefined
    || (payload !== null
      && typeof payload === 'object'
      && !Array.isArray(payload)
      && Object.keys(payload).length === 0);
}

function isValidIdPayload(payload, field) {
  return payload !== null
    && typeof payload === 'object'
    && !Array.isArray(payload)
    && Object.keys(payload).length === 1
    && typeof payload[field] === 'string'
    && UUID_PATTERN.test(payload[field]);
}

function createSocketServer(httpServer, origins = allowedOrigins) {
  const io = new Server(httpServer, {
    cors: { origin: origins, methods: ['GET', 'POST'] },
    maxHttpBufferSize: 10_000
  });

  io.use((socket, next) => {
    const origin = socket.handshake.headers.origin;
    if (origin && !origins.includes(origin)) {
      return next(new Error('ORIGEM_NAO_PERMITIDA'));
    }
    next();
  });

  io.on('connection', (socket) => {
    socket.emit('conexao:estado', { estado: 'conectado' });

    socket.on('biblioteca:entrar', (payload) => {
      if (!isEmptyPayload(payload)) {
        socket.emit('erro:validacao', { evento: 'biblioteca:entrar', mensagem: 'Payload inválido.' });
        return;
      }
      socket.join('biblioteca');
      socket.emit('biblioteca:sala', { estado: 'entrou' });
    });

    socket.on('biblioteca:sair', (payload) => {
      if (!isEmptyPayload(payload)) {
        socket.emit('erro:validacao', { evento: 'biblioteca:sair', mensagem: 'Payload inválido.' });
        return;
      }
      socket.leave('biblioteca');
      socket.emit('biblioteca:sala', { estado: 'saiu' });
    });

    socket.on('livro:acompanhar', (payload) => {
      if (!isValidIdPayload(payload, 'livroId')) {
        socket.emit('erro:validacao', { evento: 'livro:acompanhar', mensagem: 'Informe um livroId UUID válido.' });
        return;
      }
      socket.join(`livro:${payload.livroId}`);
      socket.emit('livro:sala', { livroId: payload.livroId, estado: 'acompanhando' });
    });

    socket.on('livro:parar', (payload) => {
      if (!isValidIdPayload(payload, 'livroId')) {
        socket.emit('erro:validacao', { evento: 'livro:parar', mensagem: 'Informe um livroId UUID válido.' });
        return;
      }
      socket.leave(`livro:${payload.livroId}`);
      socket.emit('livro:sala', { livroId: payload.livroId, estado: 'parou' });
    });

    socket.on('emprestimo:acompanhar', (payload) => {
      if (!isValidIdPayload(payload, 'emprestimoId')) {
        socket.emit('erro:validacao', { evento: 'emprestimo:acompanhar', mensagem: 'Informe um emprestimoId UUID válido.' });
        return;
      }
      socket.join(`emprestimo:${payload.emprestimoId}`);
      socket.emit('emprestimo:sala', { emprestimoId: payload.emprestimoId, estado: 'acompanhando' });
    });

    socket.on('emprestimo:parar', (payload) => {
      if (!isValidIdPayload(payload, 'emprestimoId')) {
        socket.emit('erro:validacao', { evento: 'emprestimo:parar', mensagem: 'Informe um emprestimoId UUID válido.' });
        return;
      }
      socket.leave(`emprestimo:${payload.emprestimoId}`);
      socket.emit('emprestimo:sala', { emprestimoId: payload.emprestimoId, estado: 'parou' });
    });

    socket.on('disconnect', (reason) => {
      console.info(`WebSocket desconectado (${reason}).`);
    });
  });

  io.engine.on('connection_error', (error) => {
    console.error(`Falha na conexão WebSocket (${error.code}): ${error.message}`);
  });

  return io;
}

module.exports = { createSocketServer };
