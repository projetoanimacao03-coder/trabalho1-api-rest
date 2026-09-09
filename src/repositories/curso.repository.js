const prisma = require('../data/prisma');
const AppError = require('../errors/app-error');
const { listOptions } = require('./query-options');

async function list(query) {
  const options = listOptions(query, ['nome', 'cargaHoraria', 'created_at'], 'nome');
  const where = query.nome ? { nome: { contains: String(query.nome), mode: 'insensitive' } } : {};
  const [dados, total] = await Promise.all([
    prisma.curso.findMany({ where, skip: options.skip, take: options.limit, orderBy: options.orderBy }),
    prisma.curso.count({ where })
  ]);
  return { dados, total, paginaAtual: options.page, totalPaginas: Math.ceil(total / options.limit) };
}

function findById(id) { return prisma.curso.findUnique({ where: { id }, include: { matriculas: { include: { estudante: true } } } }); }
function create(data) { return prisma.curso.create({ data }); }
function update(id, data) { return prisma.curso.update({ where: { id }, data }); }
async function remove(id) {
  if (await prisma.matricula.count({ where: { cursoId: id } })) throw new AppError(409, 'INTEGRIDADE_REFERENCIAL', 'Curso possui matrículas e não pode ser removido.');
  return prisma.curso.delete({ where: { id } });
}

module.exports = { list, findById, create, update, remove };
