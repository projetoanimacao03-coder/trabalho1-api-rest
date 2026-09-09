const prisma = require('../data/prisma');
const AppError = require('../errors/app-error');
const { listOptions } = require('./query-options');

async function list(query) {
  const options = listOptions(query, ['nome', 'email', 'created_at'], 'nome');
  const where = {};
  if (query.nome) where.nome = { contains: String(query.nome), mode: 'insensitive' };
  if (query.status) where.status = String(query.status);

  const [dados, total] = await Promise.all([
    prisma.estudante.findMany({ where, skip: options.skip, take: options.limit, orderBy: options.orderBy }),
    prisma.estudante.count({ where })
  ]);
  return { dados, total, paginaAtual: options.page, totalPaginas: Math.ceil(total / options.limit) };
}

function findById(id) {
  return prisma.estudante.findUnique({
    where: { id },
    include: {
      matriculas: { include: { curso: true }, orderBy: { dataMatricula: 'desc' } },
      emprestimos: { include: { livro: true }, orderBy: { data: 'desc' } }
    }
  });
}

function create(data) { return prisma.estudante.create({ data }); }
function update(id, data) { return prisma.estudante.update({ where: { id }, data }); }
async function remove(id) {
  const [matriculas, emprestimos] = await Promise.all([
    prisma.matricula.count({ where: { estudanteId: id } }),
    prisma.emprestimo.count({ where: { estudanteId: id } })
  ]);
  if (matriculas || emprestimos) throw new AppError(409, 'INTEGRIDADE_REFERENCIAL', 'Estudante possui matrículas ou empréstimos e não pode ser removido.');
  return prisma.estudante.delete({ where: { id } });
}

module.exports = { list, findById, create, update, remove };
