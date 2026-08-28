const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams é crucial para rotas aninhadas
const controller = require('../controllers/matriculas.controller');

router.post('/', controller.matricular);
router.get('/', controller.listarDoEstudante);

module.exports = router;