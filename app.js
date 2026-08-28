const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const erroMiddleware = require('./src/middlewares/erro.middleware');

const app = express();
app.use(express.json());

// Documentação Swagger configurada
const swaggerDocument = yaml.load('./src/docs/openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas com versionamento para garantir o ponto bônus
app.use('/api/v1/estudantes', require('./src/routes/estudantes.routes'));
app.use('/api/v1/cursos', require('./src/routes/cursos.routes'));
app.use('/api/v1/estudantes/:idEstudante/matriculas', require('./src/routes/matriculas.routes'));
// app.use('/api/v1/cursos', require('./src/routes/cursos.routes'));
// app.use('/api/v1/estudantes', require('./src/routes/matriculas.routes')); // Ex: /:id/matriculas

// Middleware de erros
app.use(erroMiddleware);

module.exports = app;