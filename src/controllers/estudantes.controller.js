const db = require('../data/db-memoria');
const { v4: uuidv4 } = require('uuid');

exports.listar = (req, res) => {
  let { page = 1, limit = 10, nome, status } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  let resultados = db.estudantes;

  // Filtro exato
  if (status) resultados = resultados.filter(e => e.status === status);
  // Busca por palavra-chave (titulo/nome)
  if (nome) resultados = resultados.filter(e => e.nome.toLowerCase().includes(nome.toLowerCase()));

  // Paginação
  const total = resultados.length;
  const totalPaginas = Math.ceil(total / limit);
  const inicio = (page - 1) * limit;
  const itens = resultados.slice(inicio, inicio + limit);

  res.status(200).json({
    dados: itens,
    metadados: { total, paginaAtual: page, totalPaginas }
  });
};

exports.buscarPorId = (req, res) => {
  const estudante = db.estudantes.find(e => e.id === req.params.id);
  if (!estudante) {
    return res.status(404).json({ erro: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: `Estudante com id ${req.params.id} não encontrado` } });
  }
  res.status(200).json(estudante);
};

exports.criar = (req, res) => {
  const conflito = db.estudantes.find(e => e.email === req.body.email);
  if (conflito) {
    return res.status(409).json({ erro: { codigo: "CONFLITO_DADOS", mensagem: "Já existe um estudante com este email." } });
  }
  
  const novoEstudante = { id: uuidv4(), ...req.body, status: req.body.status || 'ativo' };
  db.estudantes.push(novoEstudante);
  res.status(201).json(novoEstudante);
};

exports.substituir = (req, res) => {
  const index = db.estudantes.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ erro: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: `Estudante com id ${req.params.id} não encontrado` } });
  }
  db.estudantes[index] = { id: req.params.id, ...req.body };
  res.status(200).json(db.estudantes[index]);
};

exports.atualizarParcial = (req, res) => {
  const index = db.estudantes.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ erro: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: `Estudante com id ${req.params.id} não encontrado` } });
  }
  db.estudantes[index] = { ...db.estudantes[index], ...req.body };
  res.status(200).json(db.estudantes[index]);
};

exports.remover = (req, res) => {
  const index = db.estudantes.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ erro: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: `Estudante com id ${req.params.id} não encontrado` } });
  }
  db.estudantes.splice(index, 1);
  res.status(204).send();
};