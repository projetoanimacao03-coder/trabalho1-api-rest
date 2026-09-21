class MultaStrategy {
  constructor({ valorDiario = 2 } = {}) {
    this.valorDiario = valorDiario;
  }

  calcular({ dataDevolucao, dataLimite }) {
    const atrasoEmMs = new Date(dataDevolucao).getTime() - new Date(dataLimite).getTime();
    const diasDeAtraso = Math.max(0, Math.ceil(atrasoEmMs / 86400000));
    return diasDeAtraso * this.valorDiario;
  }
}

module.exports = MultaStrategy;
