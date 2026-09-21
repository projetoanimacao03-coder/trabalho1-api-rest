const { categoriaService: service, categoriaLivroService } = require('../config/container');
const { sendList } = require('./list-response');

exports.listar = async (req, res) => sendList(res, await service.list(req.query));
exports.buscarPorId = async (req, res) => {
  const categoria = await service.findById(req.params.id);
  if (!categoria) return res.status(404).json({ erro: { codigo: 'CATEGORIA_NAO_ENCONTRADA', mensagem: 'Categoria não encontrada.' } });
  res.json(categoria);
};
exports.criar = async (req, res) => res.status(201).json(await service.create({ nome: req.body.nome }));
exports.atualizar = async (req, res) => res.json(await service.update(req.params.id, { nome: req.body.nome }));
exports.substituir = async (req, res) => res.json(await service.update(req.params.id, { nome: req.body.nome }));
exports.remover = async (req, res) => { await service.remove(req.params.id); res.status(204).send(); };
exports.vincularLivro = async (req, res) => res.status(201).json(await categoriaLivroService.create({ categoriaId: req.params.id, livroId: req.body.livroId }));
