const express = require('express');
const controller = require('../controllers/livros.controller');
const { validarLivro } = require('../middlewares/validacao.middleware');

const router = express.Router();
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', validarLivro, controller.criar);
router.put('/:id', validarLivro, controller.substituir);
router.patch('/:id', controller.atualizar);
router.delete('/:id', controller.remover);

module.exports = router;
