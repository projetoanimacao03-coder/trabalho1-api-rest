const prisma = require('../data/prisma');
const AppError = require('../errors/app-error');
const { listOptions } = require('./query-options');

async function list(query) {
  const options = listOptions(query, ['titulo', 'disponivel', 'created_at'], 'titulo');
  const where = query.titulo ? { titulo: { contains: String(query.titulo), mode: 'insensitive' } } : {};
  const [dados, total] = await Promise.all([
    prisma.livro.findMany({ where, skip: options.skip, take: options.limit, orderBy: options.orderBy, include: { categorias: { include: { categoria: true } } } }),
    prisma.livro.count({ where })
  ]);
  return { dados, total, paginaAtual: options.page, totalPaginas: Math.ceil(total / options.limit) };
}

function findById(id) { return prisma.livro.findUnique({ where: { id }, include: { categorias: { include: { categoria: true } }, emprestimos: { include: { estudante: true } } } }); }
function create(data) { return prisma.livro.create({ data, include: { categorias: { include: { categoria: true } } } }); }
function update(id, data) { return prisma.livro.update({ where: { id }, data }); }
async function remove(id) {
  const [emprestimos, categorias] = await Promise.all([
    prisma.emprestimo.count({ where: { livroId: id } }),
    prisma.categoriaLivro.count({ where: { livroId: id } })
  ]);
  if (emprestimos || categorias) throw new AppError(409, 'INTEGRIDADE_REFERENCIAL', 'Livro possui empréstimos ou categorias e não pode ser removido.');
  return prisma.livro.delete({ where: { id } });
}

module.exports = { list, findById, create, update, remove };
