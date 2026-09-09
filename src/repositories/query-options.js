function listOptions(query, fields, defaultField) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  const field = fields.includes(query.ordenar) ? query.ordenar : defaultField;
  const direction = query.direcao === 'desc' ? 'desc' : 'asc';

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    orderBy: { [field]: direction }
  };
}

module.exports = { listOptions };
