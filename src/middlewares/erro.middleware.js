module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    erro: {
      codigo: "ERRO_INTERNO_SERVIDOR",
      mensagem: "Ocorreu um erro inesperado no servidor."
    }
  });
};