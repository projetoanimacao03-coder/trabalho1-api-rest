const express = require('express');
const router = express.Router();
const controller = require('../controllers/cursos.controller');
const { validarCurso } = require('../middlewares/validacao.middleware');

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', validarCurso, controller.criar);
router.put('/:id', validarCurso, controller.substituir);
router.patch('/:id', controller.atualizarParcial);
router.delete('/:id', controller.remover);

module.exports = router;