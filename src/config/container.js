const emprestimoRepository = require('../repositories/emprestimo.repository');
const estudanteRepository = require('../repositories/estudante.repository');
const cursoRepository = require('../repositories/curso.repository');
const livroRepository = require('../repositories/livro.repository');
const categoriaRepository = require('../repositories/categoria.repository');
const matriculaRepository = require('../repositories/matricula.repository');
const categoriaLivroRepository = require('../repositories/categoria-livro.repository');
const EmprestimoService = require('../services/emprestimo.service');
const CrudService = require('../services/crud.service');
const MultaStrategy = require('../domain/strategies/multa.strategy');

module.exports = {
  emprestimoService: new EmprestimoService(emprestimoRepository, new MultaStrategy()),
  estudanteService: new CrudService(estudanteRepository),
  cursoService: new CrudService(cursoRepository),
  livroService: new CrudService(livroRepository),
  categoriaService: new CrudService(categoriaRepository),
  matriculaService: new CrudService(matriculaRepository),
  categoriaLivroService: new CrudService(categoriaLivroRepository)
};
