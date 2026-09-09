const repository = require('../repositories/categoria.repository');
const categoriaLivroRepository = require('../repositories/categoria-livro.repository');
const { sendList } = require('./list-response');

exports.listar = async (req, res) => sendList(res, await repository.list(req.query));
exports.buscarPorId = async (req, res) => {
  const categoria = await repository.findById(req.params.id);
  if (!categoria) return res.status(404).json({ erro: { codigo: 'CATEGORIA_NAO_ENCONTRADA', mensagem: 'Categoria não encontrada.' } });
  res.json(categoria);
};
exports.criar = async (req, res) => res.status(201).json(await repository.create({ nome: req.body.nome }));
exports.atualizar = async (req, res) => res.json(await repository.update(req.params.id, { nome: req.body.nome }));
exports.substituir = async (req, res) => res.json(await repository.update(req.params.id, { nome: req.body.nome }));
exports.remover = async (req, res) => { await repository.remove(req.params.id); res.status(204).send(); };
exports.vincularLivro = async (req, res) => res.status(201).json(await categoriaLivroRepository.create({ categoriaId: req.params.id, livroId: req.body.livroId }));
