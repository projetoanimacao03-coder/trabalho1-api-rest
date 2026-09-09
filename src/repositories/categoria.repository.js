const prisma = require('../data/prisma');
const AppError = require('../errors/app-error');
const { listOptions } = require('./query-options');

async function list(query) {
  const options = listOptions(query, ['nome', 'created_at'], 'nome');
  const where = query.nome ? { nome: { contains: String(query.nome), mode: 'insensitive' } } : {};
  const [dados, total] = await Promise.all([
    prisma.categoria.findMany({ where, skip: options.skip, take: options.limit, orderBy: options.orderBy, include: { livros: { include: { livro: true } } } }),
    prisma.categoria.count({ where })
  ]);
  return { dados, total, paginaAtual: options.page, totalPaginas: Math.ceil(total / options.limit) };
}

function findById(id) { return prisma.categoria.findUnique({ where: { id }, include: { livros: { include: { livro: true } } } }); }
function create(data) { return prisma.categoria.create({ data }); }
function update(id, data) { return prisma.categoria.update({ where: { id }, data }); }
async function remove(id) {
  if (await prisma.categoriaLivro.count({ where: { categoriaId: id } })) throw new AppError(409, 'INTEGRIDADE_REFERENCIAL', 'Categoria possui livros vinculados e não pode ser removida.');
  return prisma.categoria.delete({ where: { id } });
}
function linkLivro(categoriaId, livroId) { return prisma.categoriaLivro.create({ data: { categoriaId, livroId } }); }

module.exports = { list, findById, create, update, remove, linkLivro };
