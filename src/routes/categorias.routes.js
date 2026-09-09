const express = require('express');
const controller = require('../controllers/categorias.controller');
const { validarCategoria } = require('../middlewares/validacao.middleware');

const router = express.Router();
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', validarCategoria, controller.criar);
router.put('/:id', validarCategoria, controller.substituir);
router.patch('/:id', validarCategoria, controller.atualizar);
router.delete('/:id', controller.remover);
router.post('/:id/livros', controller.vincularLivro);

module.exports = router;
