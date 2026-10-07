const request = require('supertest');
const app = require('../../app');

describe('API HTTP', () => {
  test('health informa que a API esta ativa', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('autoriza a origem do front-end local e bloqueia origens desconhecidas', async () => {
    const allowed = await request(app).get('/health').set('Origin', 'http://localhost:5500');
    expect(allowed.status).toBe(200);
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5500');

    const rejected = await request(app).get('/health').set('Origin', 'https://origem-invalida.example');
    expect(rejected.status).toBe(403);
    expect(rejected.body.erro.codigo).toBe('ORIGEM_NAO_PERMITIDA');
  });

  test('recusa emprestimo sem os identificadores obrigatorios', async () => {
    const response = await request(app).post('/api/v1/emprestimos').send({});
    expect(response.status).toBe(400);
    expect(response.body.erro.codigo).toBe('DADOS_INVALIDOS');
  });

  test('recusa estudante sem nome e email', async () => {
    const response = await request(app).post('/api/v1/estudantes').send({});
    expect(response.status).toBe(400);
    expect(response.body.erro.codigo).toBe('DADOS_INVALIDOS');
  });
});
