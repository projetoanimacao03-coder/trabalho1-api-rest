const express = require('express');
const controller = require('../controllers/matriculas.controller');
const { validarMatricula } = require('../middlewares/validacao.middleware');

const router = express.Router({ mergeParams: true });
router.post('/', validarMatricula, controller.matricular);
router.get('/', controller.listarDoEstudante);

module.exports = router;
