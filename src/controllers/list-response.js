function sendList(res, result) {
  return res.json({
    dados: result.dados,
    metadados: {
      total: result.total,
      paginaAtual: result.paginaAtual,
      totalPaginas: result.totalPaginas
    }
  });
}

module.exports = { sendList };
