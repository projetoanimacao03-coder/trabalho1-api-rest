const { cursoService: service } = require('../config/container');
const { sendList } = require('./list-response');

exports.listar = async (req, res) => sendList(res, await service.list(req.query));
exports.buscarPorId = async (req, res) => {
  const curso = await service.findById(req.params.id);
  if (!curso) return res.status(404).json({ erro: { codigo: 'CURSO_NAO_ENCONTRADO', mensagem: 'Curso não encontrado.' } });
  res.json(curso);
};
exports.criar = async (req, res) => res.status(201).json(await service.create({ nome: req.body.nome, cargaHoraria: Number(req.body.cargaHoraria) }));
exports.substituir = async (req, res) => res.json(await service.update(req.params.id, { nome: req.body.nome, cargaHoraria: Number(req.body.cargaHoraria) }));
exports.atualizarParcial = async (req, res) => {
  const data = {};
  if (req.body.nome !== undefined) data.nome = req.body.nome;
  if (req.body.cargaHoraria !== undefined) data.cargaHoraria = Number(req.body.cargaHoraria);
  res.json(await service.update(req.params.id, data));
};
exports.remover = async (req, res) => { await service.remove(req.params.id); res.status(204).send(); };
