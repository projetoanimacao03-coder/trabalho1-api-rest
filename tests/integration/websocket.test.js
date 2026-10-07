const http = require('node:http');
const { once } = require('node:events');
const { io: createClient } = require('socket.io-client');
const { createSocketServer } = require('../../src/realtime/socket-server');

function waitForEvent(emitter, eventName) {
  return new Promise((resolve) => emitter.once(eventName, resolve));
}

describe('WebSocket da biblioteca', () => {
  let server;
  let io;
  let url;
  const clients = [];

  beforeAll(async () => {
    server = http.createServer();
    io = createSocketServer(server);
    server.listen(0);
    await once(server, 'listening');
    url = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    for (const client of clients) client.disconnect();
    await new Promise((resolve) => io.close(resolve));
  });

  function connectClient() {
    const client = createClient(url, { autoConnect: false, transports: ['websocket'] });
    clients.push(client);
    const connected = waitForEvent(client, 'connect');
    client.connect();
    return connected.then(() => client);
  }

  test('envia estado de conexão e distribui atualizações na sala da biblioteca', async () => {
    const client = createClient(url, { autoConnect: false, transports: ['websocket'] });
    clients.push(client);
    const state = waitForEvent(client, 'conexao:estado');
    const connected = waitForEvent(client, 'connect');
    client.connect();
    await connected;
    expect(await state).toEqual({ estado: 'conectado' });

    const joined = waitForEvent(client, 'biblioteca:sala');
    client.emit('biblioteca:entrar');
    expect(await joined).toEqual({ estado: 'entrou' });

    const update = waitForEvent(client, 'biblioteca:atualizacao');
    io.to('biblioteca').emit('biblioteca:atualizacao', { evento: 'teste' });
    expect(await update).toEqual({ evento: 'teste' });

    const left = waitForEvent(client, 'biblioteca:sala');
    client.emit('biblioteca:sair');
    expect(await left).toEqual({ estado: 'saiu' });
  });

  test('valida cada evento recebido e rejeita payloads inválidos', async () => {
    const client = await connectClient();
    const invalidMessages = [
      ['biblioteca:entrar', { desconhecido: true }],
      ['biblioteca:sair', { desconhecido: true }],
      ['livro:acompanhar', { livroId: 'invalido' }],
      ['livro:parar', { livroId: 'invalido' }],
      ['emprestimo:acompanhar', { emprestimoId: 'invalido' }],
      ['emprestimo:parar', { emprestimoId: 'invalido' }]
    ];

    for (const [eventName, payload] of invalidMessages) {
      const error = waitForEvent(client, 'erro:validacao');
      client.emit(eventName, payload);
      expect(await error).toMatchObject({ evento: eventName });
    }
  });

  test('inscreve-se em salas específicas após validar os identificadores UUID', async () => {
    const client = await connectClient();
    const livroId = '123e4567-e89b-42d3-a456-426614174000';
    const emprestimoId = '123e4567-e89b-42d3-a456-426614174001';

    const bookJoined = waitForEvent(client, 'livro:sala');
    client.emit('livro:acompanhar', { livroId });
    expect(await bookJoined).toEqual({ livroId, estado: 'acompanhando' });

    const loanJoined = waitForEvent(client, 'emprestimo:sala');
    client.emit('emprestimo:acompanhar', { emprestimoId });
    expect(await loanJoined).toEqual({ emprestimoId, estado: 'acompanhando' });

    const bookUpdate = waitForEvent(client, 'livro:disponibilidade');
    io.to(`livro:${livroId}`).emit('livro:disponibilidade', { livroId, disponivel: 3 });
    expect(await bookUpdate).toEqual({ livroId, disponivel: 3 });

    const loanUpdate = waitForEvent(client, 'emprestimo:devolvido');
    io.to(`emprestimo:${emprestimoId}`).emit('emprestimo:devolvido', { emprestimoId });
    expect(await loanUpdate).toEqual({ emprestimoId });
  });

  test('sincroniza o mesmo evento entre clientes conectados à sala', async () => {
    const firstClient = await connectClient();
    const secondClient = await connectClient();
    const firstJoined = waitForEvent(firstClient, 'biblioteca:sala');
    const secondJoined = waitForEvent(secondClient, 'biblioteca:sala');
    firstClient.emit('biblioteca:entrar');
    secondClient.emit('biblioteca:entrar');
    await Promise.all([firstJoined, secondJoined]);

    const firstUpdate = waitForEvent(firstClient, 'emprestimo:criado');
    const secondUpdate = waitForEvent(secondClient, 'emprestimo:criado');
    io.to('biblioteca').emit('emprestimo:criado', { emprestimoId: 'teste' });
    expect(await Promise.all([firstUpdate, secondUpdate])).toEqual([
      { emprestimoId: 'teste' },
      { emprestimoId: 'teste' }
    ]);
  });

  test('encerra conexões WebSocket ao fechar o servidor', async () => {
    const closingServer = http.createServer();
    const closingIo = createSocketServer(closingServer);
    closingServer.listen(0);
    await once(closingServer, 'listening');

    const client = createClient(`http://127.0.0.1:${closingServer.address().port}`, {
      autoConnect: false,
      transports: ['websocket']
    });
    clients.push(client);
    const connected = waitForEvent(client, 'connect');
    client.connect();
    await connected;

    const disconnected = waitForEvent(client, 'disconnect');
    await new Promise((resolve) => closingIo.close(resolve));
    const reason = await disconnected;
    client.disconnect();
    expect(['io server disconnect', 'transport close']).toContain(reason);
    expect(closingServer.listening).toBe(false);
  });
});
