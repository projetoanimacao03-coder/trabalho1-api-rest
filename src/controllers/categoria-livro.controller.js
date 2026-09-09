const repository = require('../repositories/categoria-livro.repository');

exports.vincular = async (req, res) => res.status(201).json(await repository.create({ categoriaId: req.params.categoriaId, livroId: req.params.livroId }));
exports.remover = async (req, res) => { await repository.remove(req.params.livroId, req.params.categoriaId); res.status(204).send(); };
