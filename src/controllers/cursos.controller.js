const repository = require('../repositories/curso.repository');
const { sendList } = require('./list-response');

exports.listar = async (req, res) => sendList(res, await repository.list(req.query));
exports.buscarPorId = async (req, res) => {
  const curso = await repository.findById(req.params.id);
  if (!curso) return res.status(404).json({ erro: { codigo: 'CURSO_NAO_ENCONTRADO', mensagem: 'Curso não encontrado.' } });
  res.json(curso);
};
exports.criar = async (req, res) => res.status(201).json(await repository.create({ nome: req.body.nome, cargaHoraria: Number(req.body.cargaHoraria) }));
exports.substituir = async (req, res) => res.json(await repository.update(req.params.id, { nome: req.body.nome, cargaHoraria: Number(req.body.cargaHoraria) }));
exports.atualizarParcial = async (req, res) => {
  const data = {};
  if (req.body.nome !== undefined) data.nome = req.body.nome;
  if (req.body.cargaHoraria !== undefined) data.cargaHoraria = Number(req.body.cargaHoraria);
  res.json(await repository.update(req.params.id, data));
};
exports.remover = async (req, res) => { await repository.remove(req.params.id); res.status(204).send(); };
