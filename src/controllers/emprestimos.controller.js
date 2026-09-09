const repository = require('../repositories/emprestimo.repository');
const { sendList } = require('./list-response');

exports.listar = async (req, res) => sendList(res, await repository.list(req.query));
exports.buscarPorId = async (req, res) => {
  const emprestimo = await repository.findById(req.params.id);
  if (!emprestimo) return res.status(404).json({ erro: { codigo: 'EMPRESTIMO_NAO_ENCONTRADO', mensagem: 'Empréstimo não encontrado.' } });
  res.json(emprestimo);
};
exports.criar = async (req, res) => res.status(201).json(await repository.create(req.body));
exports.devolver = async (req, res) => res.json(await repository.devolver(req.params.id));
