exports.validarEstudante = (req, res, next) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({
      erro: {
        codigo: 'DADOS_INVALIDOS',
        mensagem: "Os campos 'nome' e 'email' são obrigatórios."
      }
    });
  }

  next();
};

exports.validarCurso = (req, res, next) => {
  const { nome, cargaHoraria } = req.body;

  if (!nome || cargaHoraria === undefined) {
    return res.status(400).json({
      erro: {
        codigo: 'DADOS_INVALIDOS',
        mensagem: "Os campos 'nome' e 'cargaHoraria' são obrigatórios."
      }
    });
  }

  if (!Number.isInteger(Number(cargaHoraria)) || Number(cargaHoraria) <= 0) {
    return res.status(400).json({
      erro: { codigo: 'TIPO_INVALIDO', mensagem: "'cargaHoraria' deve ser um número inteiro positivo." }
    });
  }

  next();
};

exports.validarLivro = (req, res, next) => {
  if (!req.body.titulo) return res.status(400).json({ erro: { codigo: 'DADOS_INVALIDOS', mensagem: "O campo 'titulo' é obrigatório." } });
  if (req.body.disponivel !== undefined && (!Number.isInteger(Number(req.body.disponivel)) || Number(req.body.disponivel) < 0)) {
    return res.status(400).json({ erro: { codigo: 'TIPO_INVALIDO', mensagem: "'disponivel' deve ser um número inteiro não negativo." } });
  }
  next();
};

exports.validarCategoria = (req, res, next) => {
  if (!req.body.nome) return res.status(400).json({ erro: { codigo: 'DADOS_INVALIDOS', mensagem: "O campo 'nome' é obrigatório." } });
  next();
};

exports.validarEmprestimo = (req, res, next) => {
  if (!req.body.estudanteId || !req.body.livroId) return res.status(400).json({ erro: { codigo: 'DADOS_INVALIDOS', mensagem: "'estudanteId' e 'livroId' são obrigatórios." } });
  next();
};

exports.validarMatricula = (req, res, next) => {
  if (!req.body.cursoId) return res.status(400).json({ erro: { codigo: 'DADOS_INVALIDOS', mensagem: "O campo 'cursoId' é obrigatório." } });
  next();
};
