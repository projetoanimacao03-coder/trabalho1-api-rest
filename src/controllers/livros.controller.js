const repository = require('../repositories/livro.repository');
const { sendList } = require('./list-response');

exports.listar = async (req, res) => sendList(res, await repository.list(req.query));
exports.buscarPorId = async (req, res) => {
  const livro = await repository.findById(req.params.id);
  if (!livro) return res.status(404).json({ erro: { codigo: 'LIVRO_NAO_ENCONTRADO', mensagem: 'Livro não encontrado.' } });
  res.json(livro);
};
exports.criar = async (req, res) => res.status(201).json(await repository.create({ titulo: req.body.titulo, disponivel: req.body.disponivel === undefined ? 5 : Number(req.body.disponivel) }));
exports.atualizar = async (req, res) => res.json(await repository.update(req.params.id, req.body));
exports.substituir = async (req, res) => res.json(await repository.update(req.params.id, { titulo: req.body.titulo, disponivel: Number(req.body.disponivel) }));
exports.remover = async (req, res) => { await repository.remove(req.params.id); res.status(204).send(); };
