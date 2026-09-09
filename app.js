const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');
const erroMiddleware = require('./src/middlewares/erro.middleware');

const app = express();
app.use(express.json());

// Documentação Swagger configurada
const swaggerDocument = yaml.load(path.join(__dirname, 'src', 'docs', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Rotas com versionamento para garantir o ponto bônus
app.use('/api/v1/estudantes', require('./src/routes/estudantes.routes'));
app.use('/api/v1/cursos', require('./src/routes/cursos.routes'));
app.use('/api/v1/matriculas', require('./src/routes/matriculas-root.routes'));
app.use('/api/v1/estudantes/:idEstudante/matriculas', require('./src/routes/matriculas.routes'));
app.use('/api/v1/livros', require('./src/routes/livros.routes'));
app.use('/api/v1/categorias', require('./src/routes/categorias.routes'));
app.use('/api/v1/emprestimos', require('./src/routes/emprestimos.routes'));

// Middleware de erros
app.use(erroMiddleware);

module.exports = app;