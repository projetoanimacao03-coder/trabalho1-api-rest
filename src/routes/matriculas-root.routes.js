const express = require('express');
const controller = require('../controllers/matriculas.controller');
const { validarMatricula } = require('../middlewares/validacao.middleware');

const router = express.Router();
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.put('/:id', validarMatricula, controller.atualizar);
router.delete('/:id', controller.remover);

module.exports = router;
