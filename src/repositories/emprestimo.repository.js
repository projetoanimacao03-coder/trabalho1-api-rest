const prisma = require('../data/prisma');
const AppError = require('../errors/app-error');
const { listOptions } = require('./query-options');

async function list(query) {
  const options = listOptions(query, ['data', 'created_at'], 'data');
  const where = {};
  if (query.estudanteId) where.estudanteId = String(query.estudanteId);
  if (query.livroId) where.livroId = String(query.livroId);
  if (query.ativo === 'true') where.devolvidoEm = null;
  if (query.ativo === 'false') where.devolvidoEm = { not: null };
  const [dados, total] = await Promise.all([
    prisma.emprestimo.findMany({ where, skip: options.skip, take: options.limit, orderBy: options.orderBy, include: { estudante: true, livro: true } }),
    prisma.emprestimo.count({ where })
  ]);
  return { dados, total, paginaAtual: options.page, totalPaginas: Math.ceil(total / options.limit) };
}

function findById(id) { return prisma.emprestimo.findUnique({ where: { id }, include: { estudante: true, livro: true } }); }

async function create({ estudanteId, livroId }) {
  return prisma.$transaction(async (tx) => {
    const [estudante, livro] = await Promise.all([
      tx.estudante.findUnique({ where: { id: estudanteId } }),
      tx.livro.findUnique({ where: { id: livroId } })
    ]);
    if (!estudante) throw new AppError(404, 'ESTUDANTE_NAO_ENCONTRADO', 'Estudante não encontrado.');
    if (!livro) throw new AppError(404, 'LIVRO_NAO_ENCONTRADO', 'Livro não encontrado.');
    if (livro.disponivel <= 0) throw new AppError(409, 'LIVRO_INDISPONIVEL', 'Livro sem exemplares disponíveis.');

    const ativo = await tx.emprestimo.findFirst({ where: { estudanteId, livroId, devolvidoEm: null } });
    if (ativo) throw new AppError(409, 'EMPRESTIMO_ATIVO', 'Este estudante já possui este livro emprestado.');

    const atualizado = await tx.livro.updateMany({ where: { id: livroId, disponivel: { gt: 0 } }, data: { disponivel: { decrement: 1 } } });
    if (atualizado.count !== 1) throw new AppError(409, 'LIVRO_INDISPONIVEL', 'Livro ficou indisponível durante a operação.');
    return tx.emprestimo.create({ data: { estudanteId, livroId }, include: { estudante: true, livro: true } });
  });
}

async function devolver(id) {
  return prisma.$transaction(async (tx) => {
    const emprestimo = await tx.emprestimo.findUnique({ where: { id } });
    if (!emprestimo) throw new AppError(404, 'EMPRESTIMO_NAO_ENCONTRADO', 'Empréstimo não encontrado.');
    if (emprestimo.devolvidoEm) throw new AppError(409, 'EMPRESTIMO_DEVOLVIDO', 'Este empréstimo já foi devolvido.');
    await tx.livro.update({ where: { id: emprestimo.livroId }, data: { disponivel: { increment: 1 } } });
    return tx.emprestimo.update({ where: { id }, data: { devolvidoEm: new Date() }, include: { estudante: true, livro: true } });
  });
}

module.exports = { list, findById, create, devolver };
