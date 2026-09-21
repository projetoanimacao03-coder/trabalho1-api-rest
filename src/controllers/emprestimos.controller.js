const { emprestimoService } = require('../config/container');
const { sendList } = require('./list-response');

exports.listar = async (req, res) => sendList(res, await emprestimoService.listar(req.query));
exports.buscarPorId = async (req, res) => {
  const emprestimo = await emprestimoService.buscarPorId(req.params.id);
  if (!emprestimo) return res.status(404).json({ erro: { codigo: 'EMPRESTIMO_NAO_ENCONTRADO', mensagem: 'Empréstimo não encontrado.' } });
  res.json(emprestimo);
};
exports.criar = async (req, res) => res.status(201).json(await emprestimoService.registrar(req.body));
exports.devolver = async (req, res) => res.json(await emprestimoService.devolver(req.params.id));
