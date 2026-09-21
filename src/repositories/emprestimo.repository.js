const prisma = require('../data/prisma');
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

function createTransactionRepository(client) {
  return {
    findEstudante: (id) => client.estudante.findUnique({ where: { id } }),
    findLivro: (id) => client.livro.findUnique({ where: { id } }),
    findById: (id) => client.emprestimo.findUnique({ where: { id } }),
    findAtivo: (estudanteId, livroId) => client.emprestimo.findFirst({ where: { estudanteId, livroId, devolvidoEm: null } }),
    decrementarDisponibilidade: async (id) => {
      const result = await client.livro.updateMany({ where: { id, disponivel: { gt: 0 } }, data: { disponivel: { decrement: 1 } } });
      if (result.count !== 1) throw new Error('Livro ficou indisponivel durante a operacao.');
    },
    incrementarDisponibilidade: (id) => client.livro.update({ where: { id }, data: { disponivel: { increment: 1 } } }),
    insert: (data) => client.emprestimo.create({ data, include: { estudante: true, livro: true } }),
    markAsReturned: (id) => client.emprestimo.update({ where: { id }, data: { devolvidoEm: new Date() }, include: { estudante: true, livro: true } })
  };
}

function withTransaction(work) {
  return prisma.$transaction((tx) => work(createTransactionRepository(tx)));
}

module.exports = { list, findById, withTransaction };
