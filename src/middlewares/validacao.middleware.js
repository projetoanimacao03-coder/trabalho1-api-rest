exports.validarEstudante = (req, res, next) => {
  const { nome, email, idade } = req.body;
  if (!nome || !email || !idade) {
    return res.status(400).json({
      erro: {
        codigo: "DADOS_INVALIDOS",
        mensagem: "Os campos 'nome', 'email' e 'idade' são obrigatórios."
      }
    });
  }
  if (typeof idade !== 'number') {
    return res.status(400).json({
      erro: { codigo: "TIPO_INVALIDO", mensagem: "O campo 'idade' deve ser um número." }
    });
  }
  next();
};

exports.validarCurso = (req, res, next) => {
  const { nome, cargaHoraria } = req.body;
  if (!nome || !cargaHoraria) {
    return res.status(400).json({
      erro: {
        codigo: "DADOS_INVALIDOS",
        mensagem: "Os campos 'nome' e 'cargaHoraria' são obrigatórios."
      }
    });
  }
  next();
};