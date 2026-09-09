const express = require('express');
const controller = require('../controllers/estudantes.controller');
const { validarEstudante } = require('../middlewares/validacao.middleware');

const router = express.Router();
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', validarEstudante, controller.criar);
router.put('/:id', validarEstudante, controller.substituir);
router.patch('/:id', controller.atualizarParcial);
router.delete('/:id', controller.remover);

module.exports = router;
