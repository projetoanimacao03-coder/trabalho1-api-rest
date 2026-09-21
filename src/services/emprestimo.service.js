const AppError = require('../errors/app-error');

class EmprestimoService {
  constructor(repository, multaStrategy) {
    this.repository = repository;
    this.multaStrategy = multaStrategy;
  }

  listar(query) {
    return this.repository.list(query);
  }

  buscarPorId(id) {
    return this.repository.findById(id);
  }

  registrar({ estudanteId, livroId }) {
    return this.repository.withTransaction(async (repository) => {
      const [estudante, livro] = await Promise.all([
        repository.findEstudante(estudanteId),
        repository.findLivro(livroId)
      ]);
      if (!estudante) throw new AppError(404, 'ESTUDANTE_NAO_ENCONTRADO', 'Estudante não encontrado.');
      if (!livro) throw new AppError(404, 'LIVRO_NAO_ENCONTRADO', 'Livro não encontrado.');
      if (livro.disponivel <= 0) throw new AppError(409, 'LIVRO_INDISPONIVEL', 'Livro sem exemplares disponíveis.');
      if (await repository.findAtivo(estudanteId, livroId)) throw new AppError(409, 'EMPRESTIMO_ATIVO', 'Este estudante já possui este livro emprestado.');
      await repository.decrementarDisponibilidade(livroId);
      return repository.insert({ estudanteId, livroId });
    });
  }

  devolver(id) {
    return this.repository.withTransaction(async (repository) => {
      const emprestimo = await repository.findById(id);
      if (!emprestimo) throw new AppError(404, 'EMPRESTIMO_NAO_ENCONTRADO', 'Empréstimo não encontrado.');
      if (emprestimo.devolvidoEm) throw new AppError(409, 'EMPRESTIMO_DEVOLVIDO', 'Este empréstimo já foi devolvido.');
      await repository.incrementarDisponibilidade(emprestimo.livroId);
      return repository.markAsReturned(id);
    });
  }

  calcularMulta(data) {
    return this.multaStrategy.calcular(data);
  }
}

module.exports = EmprestimoService;
