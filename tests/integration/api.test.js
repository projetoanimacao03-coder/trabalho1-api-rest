const request = require('supertest');
const app = require('../../app');

describe('API HTTP', () => {
  test('health informa que a API esta ativa', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
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
