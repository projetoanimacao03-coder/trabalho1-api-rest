const { categoriaLivroService: service } = require('../config/container');

exports.vincular = async (req, res) => res.status(201).json(await service.create({ categoriaId: req.params.categoriaId, livroId: req.params.livroId }));
exports.remover = async (req, res) => { await service.remove(req.params.livroId, req.params.categoriaId); res.status(204).send(); };
