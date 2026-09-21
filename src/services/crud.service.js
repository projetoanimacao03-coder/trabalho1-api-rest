class CrudService {
  constructor(repository) {
    this.repository = repository;
  }

  list(...args) { return this.repository.list(...args); }
  findById(...args) { return this.repository.findById(...args); }
  create(...args) { return this.repository.create(...args); }
  update(...args) { return this.repository.update(...args); }
  remove(...args) { return this.repository.remove(...args); }
}

module.exports = CrudService;
