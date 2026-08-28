const db = require('../data/db-memoria');
const { v4: uuidv4 } = require('uuid');

exports.matricular = (req, res) => {
  const estudante = db.estudantes.find(e => e.id === req.params.idEstudante);
  if (!estudante) return res.status(404).json({ erro: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: "Estudante não encontrado" } });

  const novaMatricula = {
    id: uuidv4(),
    estudanteId: req.params.idEstudante,
    cursoId: req.body.cursoId,
    dataMatricula: new Date().toISOString()
  };
  
  db.matriculas.push(novaMatricula);
  res.status(201).json(novaMatricula);
};

exports.listarDoEstudante = (req, res) => {
  const matriculas = db.matriculas.filter(m => m.estudanteId === req.params.idEstudante);
  res.status(200).json(matriculas);
};