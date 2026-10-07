const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');
const erroMiddleware = require('./src/middlewares/erro.middleware');
const { allowedOrigins } = require('./src/config/origins');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      erro: { codigo: 'ORIGEM_NAO_PERMITIDA', mensagem: 'Esta origem não está autorizada.' }
    });
  }

  if (origin) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const swaggerDocument = yaml.load(path.join(__dirname, 'src', 'docs', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/estudantes', require('./src/routes/estudantes.routes'));
app.use('/api/v1/cursos', require('./src/routes/cursos.routes'));
app.use('/api/v1/matriculas', require('./src/routes/matriculas-root.routes'));
app.use('/api/v1/estudantes/:idEstudante/matriculas', require('./src/routes/matriculas.routes'));
app.use('/api/v1/livros', require('./src/routes/livros.routes'));
app.use('/api/v1/categorias', require('./src/routes/categorias.routes'));
app.use('/api/v1/emprestimos', require('./src/routes/emprestimos.routes'));

app.use(erroMiddleware);

module.exports = app;