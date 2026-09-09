const prisma = require('../data/prisma');
const AppError = require('../errors/app-error');
const { listOptions } = require('./query-options');

async function list(query, estudanteId) {
  const options = listOptions(query, ['dataMatricula', 'created_at'], 'dataMatricula');
  const where = estudanteId ? { estudanteId } : {};
  const [dados, total] = await Promise.all([
    prisma.matricula.findMany({ where, skip: options.skip, take: options.limit, orderBy: options.orderBy, include: { estudante: true, curso: true } }),
    prisma.matricula.count({ where })
  ]);
  return { dados, total, paginaAtual: options.page, totalPaginas: Math.ceil(total / options.limit) };
}

function findById(id) { return prisma.matricula.findUnique({ where: { id }, include: { estudante: true, curso: true } }); }
async function create(data) {
  const [estudante, curso] = await Promise.all([
    prisma.estudante.findUnique({ where: { id: data.estudanteId } }),
    prisma.curso.findUnique({ where: { id: data.cursoId } })
  ]);
  if (!estudante) throw new AppError(404, 'ESTUDANTE_NAO_ENCONTRADO', 'Estudante não encontrado.');
  if (!curso) throw new AppError(404, 'CURSO_NAO_ENCONTRADO', 'Curso não encontrado.');
  return prisma.matricula.create({ data, include: { estudante: true, curso: true } });
}
function remove(id) { return prisma.matricula.delete({ where: { id } }); }

async function update(id, cursoId) {
  const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
  if (!curso) throw new AppError(404, 'CURSO_NAO_ENCONTRADO', 'Curso não encontrado.');
  return prisma.matricula.update({ where: { id }, data: { cursoId }, include: { estudante: true, curso: true } });
}

module.exports = { list, findById, create, update, remove };
