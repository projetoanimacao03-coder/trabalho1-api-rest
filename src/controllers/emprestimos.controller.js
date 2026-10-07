const { emprestimoService } = require('../config/container');
const { sendList } = require('./list-response');
const { notificarEmprestimo } = require('../realtime/notificacoes');

exports.listar = async (req, res) => sendList(res, await emprestimoService.listar(req.query));
exports.buscarPorId = async (req, res) => {
  const emprestimo = await emprestimoService.buscarPorId(req.params.id);
  if (!emprestimo) return res.status(404).json({ erro: { codigo: 'EMPRESTIMO_NAO_ENCONTRADO', mensagem: 'Empréstimo não encontrado.' } });
  res.json(emprestimo);
};
exports.criar = async (req, res) => {
  const emprestimo = await emprestimoService.registrar(req.body);
  notificarEmprestimo(req, 'emprestimo:criado', emprestimo);
  res.status(201).json(emprestimo);
};

exports.devolver = async (req, res) => {
  const emprestimo = await emprestimoService.devolver(req.params.id);
  notificarEmprestimo(req, 'emprestimo:devolvido', emprestimo);
  res.json(emprestimo);
};
