const AppError = require('../../errors/app-error');

class EmprestimoEmMemoriaRepository {
  constructor({ estudantes = [], livros = [], emprestimos = [] } = {}) {
    this.estudantes = estudantes;
    this.livros = livros;
    this.emprestimos = emprestimos;
  }

  async list() {
    return {
      dados: this.emprestimos,
      total: this.emprestimos.length,
      paginaAtual: 1,
      totalPaginas: this.emprestimos.length ? 1 : 0
    };
  }

  async findById(id) {
    return this.emprestimos.find((emprestimo) => emprestimo.id === id) || null;
  }

  withTransaction(work) {
    return work(this);
  }

  findEstudante(id) { return Promise.resolve(this.estudantes.find((item) => item.id === id)); }
  findLivro(id) { return Promise.resolve(this.livros.find((item) => item.id === id)); }
  findAtivo(estudanteId, livroId) {
    return Promise.resolve(this.emprestimos.find((item) => item.estudanteId === estudanteId && item.livroId === livroId && !item.devolvidoEm));
  }
  decrementarDisponibilidade(id) {
    const livro = this.livros.find((item) => item.id === id);
    if (!livro || livro.disponivel <= 0) throw new AppError(409, 'LIVRO_INDISPONIVEL', 'Livro ficou indisponível durante a operação.');
    livro.disponivel -= 1;
  }
  incrementarDisponibilidade(id) {
    const livro = this.livros.find((item) => item.id === id);
    livro.disponivel += 1;
  }
  insert({ estudanteId, livroId }) {
    const emprestimo = { id: `emprestimo-${this.emprestimos.length + 1}`, estudanteId, livroId, devolvidoEm: null };
    this.emprestimos.push(emprestimo);
    return Promise.resolve(emprestimo);
  }
  markAsReturned(id) {
    const emprestimo = this.emprestimos.find((item) => item.id === id);
    emprestimo.devolvidoEm = new Date();
    return Promise.resolve(emprestimo);
  }

  async create({ estudanteId, livroId }) {
    const estudante = this.estudantes.find((item) => item.id === estudanteId);
    const livro = this.livros.find((item) => item.id === livroId);
    if (!estudante) throw new AppError(404, 'ESTUDANTE_NAO_ENCONTRADO', 'Estudante não encontrado.');
    if (!livro) throw new AppError(404, 'LIVRO_NAO_ENCONTRADO', 'Livro não encontrado.');
    if (livro.disponivel <= 0) throw new AppError(409, 'LIVRO_INDISPONIVEL', 'Livro sem exemplares disponíveis.');
    if (this.emprestimos.some((item) => item.estudanteId === estudanteId && item.livroId === livroId && !item.devolvidoEm)) {
      throw new AppError(409, 'EMPRESTIMO_ATIVO', 'Este estudante já possui este livro emprestado.');
    }

    livro.disponivel -= 1;
    const emprestimo = { id: `emprestimo-${this.emprestimos.length + 1}`, estudanteId, livroId, devolvidoEm: null };
    this.emprestimos.push(emprestimo);
    return emprestimo;
  }

  async devolver(id) {
    const emprestimo = await this.findById(id);
    if (!emprestimo) throw new AppError(404, 'EMPRESTIMO_NAO_ENCONTRADO', 'Empréstimo não encontrado.');
    if (emprestimo.devolvidoEm) throw new AppError(409, 'EMPRESTIMO_DEVOLVIDO', 'Este empréstimo já foi devolvido.');
    const livro = this.livros.find((item) => item.id === emprestimo.livroId);
    livro.disponivel += 1;
    emprestimo.devolvidoEm = new Date();
    return emprestimo;
  }
}

module.exports = EmprestimoEmMemoriaRepository;
