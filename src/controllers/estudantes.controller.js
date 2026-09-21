const { estudanteService: service } = require('../config/container');
const { sendList } = require('./list-response');

exports.listar = async (req, res) => sendList(res, await service.list(req.query));

exports.buscarPorId = async (req, res) => {
  const estudante = await service.findById(req.params.id);
  if (!estudante) return res.status(404).json({ erro: { codigo: 'ESTUDANTE_NAO_ENCONTRADO', mensagem: 'Estudante não encontrado.' } });
  res.json(estudante);
};

exports.criar = async (req, res) => res.status(201).json(await service.create({ nome: req.body.nome, email: req.body.email, status: req.body.status || 'ativo' }));
exports.substituir = async (req, res) => res.json(await service.update(req.params.id, { nome: req.body.nome, email: req.body.email, status: req.body.status || 'ativo' }));

exports.atualizarParcial = async (req, res) => {
  const data = {};
  for (const field of ['nome', 'email', 'status']) if (req.body[field] !== undefined) data[field] = req.body[field];
  res.json(await service.update(req.params.id, data));
};

exports.remover = async (req, res) => { await service.remove(req.params.id); res.status(204).send(); };
