const db = require('../data/db-memoria');
const { v4: uuidv4 } = require('uuid');

exports.listar = (req, res) => res.status(200).json(db.cursos);

exports.buscarPorId = (req, res) => {
  const curso = db.cursos.find(c => c.id === req.params.id);
  if (!curso) return res.status(404).json({ erro: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: "Curso não encontrado" } });
  res.status(200).json(curso);
};

exports.criar = (req, res) => {
  const novoCurso = { id: uuidv4(), ...req.body };
  db.cursos.push(novoCurso);
  res.status(201).json(novoCurso);
};

exports.substituir = (req, res) => {
  const index = db.cursos.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ erro: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: "Curso não encontrado" } });
  db.cursos[index] = { id: req.params.id, ...req.body };
  res.status(200).json(db.cursos[index]);
};

exports.atualizarParcial = (req, res) => {
  const index = db.cursos.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ erro: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: "Curso não encontrado" } });
  db.cursos[index] = { ...db.cursos[index], ...req.body };
  res.status(200).json(db.cursos[index]);
};

exports.remover = (req, res) => {
  const index = db.cursos.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ erro: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: "Curso não encontrado" } });
  db.cursos.splice(index, 1);
  res.status(204).send();
};