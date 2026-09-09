const prisma = require('../data/prisma');
const AppError = require('../errors/app-error');

async function create(data) {
  const [livro, categoria] = await Promise.all([
    prisma.livro.findUnique({ where: { id: data.livroId } }),
    prisma.categoria.findUnique({ where: { id: data.categoriaId } })
  ]);
  if (!livro) throw new AppError(404, 'LIVRO_NAO_ENCONTRADO', 'Livro não encontrado.');
  if (!categoria) throw new AppError(404, 'CATEGORIA_NAO_ENCONTRADA', 'Categoria não encontrada.');
  return prisma.categoriaLivro.create({ data, include: { livro: true, categoria: true } });
}

function remove(livroId, categoriaId) {
  return prisma.categoriaLivro.delete({ where: { livroId_categoriaId: { livroId, categoriaId } } });
}

module.exports = { create, remove };
