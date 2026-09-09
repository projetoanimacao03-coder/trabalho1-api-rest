const repository = require('../repositories/matricula.repository');
const { sendList } = require('./list-response');

exports.listar = async (req, res) => sendList(res, await repository.list(req.query, req.query.estudanteId));
exports.listarDoEstudante = async (req, res) => sendList(res, await repository.list(req.query, req.params.idEstudante));
exports.buscarPorId = async (req, res) => {
  const matricula = await repository.findById(req.params.id);
  if (!matricula) return res.status(404).json({ erro: { codigo: 'MATRICULA_NAO_ENCONTRADA', mensagem: 'Matrícula não encontrada.' } });
  res.json(matricula);
};
exports.matricular = async (req, res) => res.status(201).json(await repository.create({ estudanteId: req.params.idEstudante, cursoId: req.body.cursoId }));
exports.atualizar = async (req, res) => res.json(await repository.update(req.params.id, req.body.cursoId));
exports.remover = async (req, res) => { await repository.remove(req.params.id); res.status(204).send(); };
