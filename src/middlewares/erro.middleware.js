module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.status && err.code) {
    return res.status(err.status).json({ erro: { codigo: err.code, mensagem: err.message } });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      erro: { codigo: 'CONFLITO_DADOS', mensagem: 'Um registro com esses dados já existe.' }
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      erro: { codigo: 'RECURSO_NAO_ENCONTRADO', mensagem: 'Recurso não encontrado.' }
    });
  }

  if (err.code === 'P2003' || err.code === 'P2014') {
    return res.status(409).json({
      erro: { codigo: 'INTEGRIDADE_REFERENCIAL', mensagem: 'A operação viola uma relação existente entre registros.' }
    });
  }

  if (err.code === 'P1001' || err.code === 'P1000' || err.code === 'P1017') {
    return res.status(503).json({
      erro: { codigo: 'BANCO_INDISPONIVEL', mensagem: 'Não foi possível acessar o banco de dados.' }
    });
  }

  res.status(500).json({
    erro: {
      codigo: 'ERRO_INTERNO_SERVIDOR',
      mensagem: 'Ocorreu um erro inesperado no servidor.'
    }
  });
};
