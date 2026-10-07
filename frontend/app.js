(() => {
  const API_BASE_URL = (window.APP_CONFIG.API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const elements = {
    connection: document.querySelector('.connection'),
    connectionDot: document.querySelector('#connection-dot'),
    connectionLabel: document.querySelector('#connection-label'),
    studentCount: document.querySelector('#student-count'),
    bookCount: document.querySelector('#book-count'),
    loanCount: document.querySelector('#loan-count'),
    loanStudent: document.querySelector('#loan-student'),
    loanBook: document.querySelector('#loan-book'),
    loanList: document.querySelector('#loan-list'),
    bookList: document.querySelector('#book-list'),
    activityList: document.querySelector('#activity-list'),
    pageError: document.querySelector('#page-error')
  };

  let students = [];
  let books = [];

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    if (response.status === 204) return null;

    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.erro?.mensagem || `A API respondeu com status ${response.status}.`);
    }
    return body;
  }

  function addActivity(message) {
    const empty = elements.activityList.querySelector('.empty-state');
    if (empty) empty.remove();
    const item = document.createElement('li');
    item.className = 'activity-item';
    const content = document.createElement('div');
    content.textContent = message;
    const time = document.createElement('span');
    time.className = 'activity-time';
    time.textContent = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date());
    content.append(time);
    item.append(content);
    elements.activityList.prepend(item);
    while (elements.activityList.children.length > 8) elements.activityList.lastElementChild.remove();
  }

  function setFeedback(id, message, isError = false) {
    const feedback = document.querySelector(`#${id}`);
    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
  }

  function updateSelect(select, records, placeholder, label) {
    select.replaceChildren(new Option(placeholder, ''));
    for (const record of records) {
      select.add(new Option(label(record), record.id));
    }
    select.disabled = records.length === 0;
  }

  function renderBooks() {
    elements.bookCount.textContent = books.length;
    const availableBooks = books.filter((book) => book.disponivel > 0);
    updateSelect(
      elements.loanBook,
      availableBooks,
      availableBooks.length ? 'Selecione um livro' : 'Nenhum livro disponível',
      (book) => `${book.titulo} (${book.disponivel} disp.)`
    );

    elements.bookList.replaceChildren();
    if (books.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'Nenhum livro cadastrado.';
      elements.bookList.append(empty);
      return;
    }

    for (const book of books) {
      const item = document.createElement('li');
      item.className = 'book-item';
      const title = document.createElement('span');
      title.className = 'book-title';
      title.textContent = book.titulo;
      const availability = document.createElement('span');
      availability.className = 'book-availability';
      availability.textContent = `${book.disponivel} disponível(is)`;
      item.append(title, availability);
      elements.bookList.append(item);
    }
  }

  function renderLoans(loans) {
    elements.loanCount.textContent = loans.length;
    elements.loanList.replaceChildren();
    if (loans.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.className = 'empty-cell';
      cell.colSpan = 4;
      cell.textContent = 'Nenhum empréstimo ativo.';
      row.append(cell);
      elements.loanList.append(row);
      return;
    }

    for (const loan of loans) {
      const row = document.createElement('tr');
      const student = document.createElement('td');
      student.textContent = loan.estudante.nome;
      const book = document.createElement('td');
      book.textContent = loan.livro.titulo;
      const date = document.createElement('td');
      date.textContent = new Intl.DateTimeFormat('pt-BR').format(new Date(loan.data));
      const actionCell = document.createElement('td');
      const button = document.createElement('button');
      button.className = 'return-button';
      button.type = 'button';
      button.textContent = 'Registrar devolução';
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          await api(`/api/v1/emprestimos/${encodeURIComponent(loan.id)}/devolucao`, { method: 'POST' });
          addActivity(`Devolução registrada: ${loan.livro.titulo} · ${loan.estudante.nome}`);
          await refresh();
        } catch (error) {
          button.disabled = false;
          showError(error.message);
        }
      });
      actionCell.append(button);
      row.append(student, book, date, actionCell);
      elements.loanList.append(row);
    }
  }

  function showError(message) {
    elements.pageError.textContent = message;
  }

  async function refresh() {
    elements.pageError.textContent = '';
    try {
      const [studentResponse, bookResponse, loanResponse] = await Promise.all([
        api('/api/v1/estudantes?limit=100'),
        api('/api/v1/livros?limit=100'),
        api('/api/v1/emprestimos?ativo=true&ordenar=data&direcao=desc&limit=100')
      ]);
      students = studentResponse.dados;
      books = bookResponse.dados;
      elements.studentCount.textContent = students.length;
      updateSelect(elements.loanStudent, students, students.length ? 'Selecione um estudante' : 'Cadastre um estudante', (student) => student.nome);
      renderBooks();
      renderLoans(loanResponse.dados);
    } catch (error) {
      showError(`Não foi possível carregar os dados: ${error.message}`);
    }
  }

  document.querySelector('#loan-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form));
    submit.disabled = true;
    setFeedback('loan-feedback', '');
    try {
      await api('/api/v1/emprestimos', { method: 'POST', body: JSON.stringify(data) });
      form.reset();
      setFeedback('loan-feedback', 'Empréstimo registrado e sincronizado.');
      await refresh();
    } catch (error) {
      setFeedback('loan-feedback', error.message, true);
    } finally {
      submit.disabled = false;
    }
  });

  document.querySelector('#student-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    setFeedback('student-feedback', '');
    try {
      const data = Object.fromEntries(new FormData(form));
      await api('/api/v1/estudantes', { method: 'POST', body: JSON.stringify(data) });
      form.reset();
      setFeedback('student-feedback', 'Estudante cadastrado.');
      await refresh();
    } catch (error) {
      setFeedback('student-feedback', error.message, true);
    } finally {
      submit.disabled = false;
    }
  });

  document.querySelector('#book-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    setFeedback('book-feedback', '');
    try {
      const data = Object.fromEntries(new FormData(form));
      await api('/api/v1/livros', { method: 'POST', body: JSON.stringify(data) });
      form.reset();
      setFeedback('book-feedback', 'Livro cadastrado.');
      await refresh();
    } catch (error) {
      setFeedback('book-feedback', error.message, true);
    } finally {
      submit.disabled = false;
    }
  });

  document.querySelector('#refresh-button').addEventListener('click', refresh);
  document.querySelector('#api-docs-link').href = `${API_BASE_URL}/docs`;

  if (typeof window.io === 'function') {
    const socket = window.io(API_BASE_URL, { reconnection: true });
    socket.on('connect', () => {
      elements.connection.classList.add('is-online');
      elements.connectionLabel.textContent = 'Conectado · atualizações ao vivo';
      socket.emit('biblioteca:entrar');
    });
    socket.on('conexao:estado', () => addActivity('Conexão em tempo real estabelecida.'));
    socket.on('biblioteca:sala', (data) => {
      if (data.estado === 'entrou') addActivity('Inscrito nas atualizações da biblioteca.');
    });
    socket.on('emprestimo:criado', (data) => {
      addActivity(`Novo empréstimo: ${data.livro} · ${data.estudante}`);
      refresh();
    });
    socket.on('emprestimo:devolvido', (data) => {
      addActivity(`Devolução confirmada: ${data.livro} · ${data.estudante}`);
      refresh();
    });
    socket.on('livro:disponibilidade', (data) => {
      addActivity(`Disponibilidade atualizada: ${data.titulo} · ${data.disponivel} exemplar(es).`);
      refresh();
    });
    socket.on('biblioteca:atualizacao', (data) => {
      if (!['emprestimo:criado', 'emprestimo:devolvido'].includes(data.evento)) {
        addActivity('A biblioteca recebeu uma nova atualização.');
        refresh();
      }
    });
    socket.on('erro:validacao', (data) => showError(`WebSocket: ${data.mensagem}`));
    socket.on('disconnect', () => {
      elements.connection.classList.remove('is-online');
      elements.connectionLabel.textContent = 'Reconectando...';
    });
    socket.on('connect_error', (error) => {
      elements.connection.classList.remove('is-online');
      elements.connectionLabel.textContent = 'Tempo real indisponível';
      showError(`WebSocket: ${error.message}`);
    });
  } else {
    elements.connectionLabel.textContent = 'Cliente WebSocket indisponível';
  }

  refresh();
})();
