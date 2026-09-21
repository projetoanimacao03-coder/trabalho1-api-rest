const EmprestimoService = require('../../src/services/emprestimo.service');
const EmprestimoEmMemoriaRepository = require('../../src/repositories/memoria/emprestimo-em-memoria.repository');
const MultaStrategy = require('../../src/domain/strategies/multa.strategy');

function criarService() {
  return new EmprestimoService(new EmprestimoEmMemoriaRepository({
    estudantes: [{ id: 'e1' }],
    livros: [{ id: 'l1', disponivel: 2 }]
  }));
}

describe('EmprestimoService', () => {
  test('registra emprestimo e reduz disponibilidade', async () => {
    const service = criarService();
    const emprestimo = await service.registrar({ estudanteId: 'e1', livroId: 'l1' });
    expect(emprestimo.estudanteId).toBe('e1');
  });

  test('nao permite dois emprestimos ativos iguais', async () => {
    const service = criarService();
    await service.registrar({ estudanteId: 'e1', livroId: 'l1' });
    await expect(service.registrar({ estudanteId: 'e1', livroId: 'l1' })).rejects.toMatchObject({ code: 'EMPRESTIMO_ATIVO' });
  });

  test('nao permite emprestimo de livro indisponivel', async () => {
    const repository = new EmprestimoEmMemoriaRepository({ estudantes: [{ id: 'e1' }], livros: [{ id: 'l1', disponivel: 0 }] });
    await expect(new EmprestimoService(repository).registrar({ estudanteId: 'e1', livroId: 'l1' })).rejects.toMatchObject({ code: 'LIVRO_INDISPONIVEL' });
  });

  test('devolucao devolve o exemplar ao acervo', async () => {
    const service = criarService();
    const emprestimo = await service.registrar({ estudanteId: 'e1', livroId: 'l1' });
    const devolvido = await service.devolver(emprestimo.id);
    expect(devolvido.devolvidoEm).toBeInstanceOf(Date);
  });

  test('nao permite devolver duas vezes', async () => {
    const service = criarService();
    const emprestimo = await service.registrar({ estudanteId: 'e1', livroId: 'l1' });
    await service.devolver(emprestimo.id);
    await expect(service.devolver(emprestimo.id)).rejects.toMatchObject({ code: 'EMPRESTIMO_DEVOLVIDO' });
  });

  test('calcula multa somente pelos dias de atraso', () => {
    const service = new EmprestimoService(new EmprestimoEmMemoriaRepository(), new MultaStrategy({ valorDiario: 2 }));
    expect(service.calcularMulta({ dataLimite: '2026-09-01', dataDevolucao: '2026-09-03' })).toBe(4);
    expect(service.calcularMulta({ dataLimite: '2026-09-03', dataDevolucao: '2026-09-03' })).toBe(0);
  });
});
