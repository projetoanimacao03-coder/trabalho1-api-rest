function notificarEmprestimo(req, evento, emprestimo) {
  const io = req.app.get('io');
  if (!io) return;

  const livroId = emprestimo.livroId || emprestimo.livro.id;
  const atualizacao = {
    emprestimoId: emprestimo.id,
    estudante: emprestimo.estudante.nome,
    livro: emprestimo.livro.titulo,
    data: emprestimo.data,
    devolvidoEm: emprestimo.devolvidoEm
  };

  io.to('biblioteca').emit(evento, atualizacao);
  io.to('biblioteca').emit('biblioteca:atualizacao', { evento, emprestimoId: emprestimo.id });
  io.to(`livro:${livroId}`).emit('livro:disponibilidade', {
    livroId,
    titulo: emprestimo.livro.titulo,
    disponivel: emprestimo.livro.disponivel
  });
  io.to(`emprestimo:${emprestimo.id}`).emit(evento, atualizacao);
}

module.exports = { notificarEmprestimo };
