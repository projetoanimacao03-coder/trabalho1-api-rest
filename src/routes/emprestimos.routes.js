const express = require('express');
const controller = require('../controllers/emprestimos.controller');
const { validarEmprestimo } = require('../middlewares/validacao.middleware');

const router = express.Router();
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', validarEmprestimo, controller.criar);
router.post('/:id/devolucao', controller.devolver);

module.exports = router;
