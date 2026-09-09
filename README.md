# Trabalho 2: API REST com Prisma e PostgreSQL

API de gestão de estudantes, cursos, livros, categorias, matrículas e empréstimos. O armazenamento é PostgreSQL e todo acesso aos dados é feito por Prisma ORM.

## Requisitos

- Node.js 20 ou superior
- PostgreSQL 15 ou superior
- npm

## Instalação do zero

1. Instale as dependências:

```bash
npm install
```

2. Copie `.env.example` para `.env` e informe as credenciais locais:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/postgres?schema=public"
PORT=3000
```

O arquivo `.env` não deve ser versionado.

3. Gere o Prisma Client e aplique as migrations:

```bash
npm run prisma:generate
npm run migrate:deploy
npm run prisma:seed
```

4. Inicie a API:

```bash
npm start
```

Documentação Swagger: `http://localhost:3000/docs`

## Migrations

As migrations são versionadas em `prisma/migrations` e não devem ser editadas depois de aplicadas:

- `20260909021025_init_postgresql`: cria as sete tabelas, chaves, auditoria e restrições básicas.
- `20260909091500_persistencia_integridade_indices`: adiciona status, controle de devolução e índices das consultas frequentes.

Para recriar somente o banco local durante o desenvolvimento:

```bash
npm run migrate:reset
npm run prisma:seed
```

## Modelo de dados

```mermaid
erDiagram
    ESTUDANTE ||--o{ MATRICULA : realiza
    CURSO ||--o{ MATRICULA : possui
    ESTUDANTE ||--o{ EMPRESTIMO : faz
    LIVRO ||--o{ EMPRESTIMO : recebe
    LIVRO ||--o{ CATEGORIA_LIVRO : classifica
    CATEGORIA ||--o{ CATEGORIA_LIVRO : agrupa

    ESTUDANTE {
      string id PK
      string nome
      string email UK
      string status
      datetime created_at
      datetime updated_at
    }
    CURSO {
      string id PK
      string nome
      int cargaHoraria
      datetime created_at
      datetime updated_at
    }
    MATRICULA {
      string id PK
      string estudanteId FK
      string cursoId FK
      datetime dataMatricula
    }
    LIVRO {
      string id PK
      string titulo
      int disponivel
      datetime created_at
      datetime updated_at
    }
    CATEGORIA {
      string id PK
      string nome UK
      datetime created_at
      datetime updated_at
    }
    CATEGORIA_LIVRO {
      string livroId PK, FK
      string categoriaId PK, FK
    }
    EMPRESTIMO {
      string id PK
      string estudanteId FK
      string livroId FK
      datetime data
      datetime devolvidoEm
    }
```

A convenção de tabelas e campos é camelCase para chaves de relacionamento e snake_case para auditoria, conforme os nomes do schema Prisma.

## Endpoints

Todos usam o prefixo `/api/v1`.

- `GET/POST /estudantes`
- `GET/PATCH/PUT/DELETE /estudantes/:id`
- `GET/POST /cursos`
- `GET/PATCH/PUT/DELETE /cursos/:id`
- `GET /estudantes/:idEstudante/matriculas`
- `POST /estudantes/:idEstudante/matriculas`
- `GET /matriculas`, `GET /matriculas/:id`, `DELETE /matriculas/:id`
- `GET/POST /livros`, `GET/PATCH/DELETE /livros/:id`
- `GET/POST /categorias`, `GET/PATCH/DELETE /categorias/:id`
- `POST /categorias/:id/livros`
- `GET/POST /emprestimos`, `GET /emprestimos/:id`
- `POST /emprestimos/:id/devolucao`

Listagens aceitam `page`, `limit`, `ordenar` e `direcao=asc|desc`. Cada filtro é aplicado no banco, por exemplo:

```text
GET /api/v1/livros?titulo=po&ordenar=titulo&direcao=asc&page=1&limit=10
GET /api/v1/emprestimos?ativo=true&ordenar=data&direcao=desc
```

`GET /estudantes/:id`, `GET /livros/:id` e `GET /categorias/:id` retornam dados relacionados com `include`, evitando N+1.

## Integridade e transação

- Emails, nomes de categorias e matrículas repetidas retornam `409`.
- Chaves estrangeiras inexistentes retornam `404` ou `409`, conforme a operação.
- Exclusões que possuem relações dependentes são bloqueadas com `409`.
- Criar empréstimo valida estudante, livro e disponibilidade dentro de uma transação; a criação do empréstimo e o decremento de `Livro.disponivel` são atômicos.
- Devolver empréstimo também atualiza o livro e o empréstimo na mesma transação.
- Falhas de conexão retornam `503` sem derrubar o servidor nem expor SQL do PostgreSQL.

## Organização

- `prisma/schema.prisma`: modelo relacional.
- `prisma/migrations`: histórico versionado.
- `prisma/seed.js`: dados de demonstração.
- `src/repositories`: único local das consultas Prisma.
- `src/controllers`: tradução entre HTTP e repositories.
- `src/routes`: rotas da API.
- `src/middlewares`: validação e tratamento de erros.
- `src/docs/openapi.yaml`: contrato Swagger.

## Testes rápidos

```bash
npm run prisma:generate
npm run migrate:deploy
npm run prisma:seed
npm start
```

Em outra janela:

```bash
curl http://localhost:3000/health
curl "http://localhost:3000/api/v1/estudantes?ordenar=nome&direcao=asc"
curl "http://localhost:3000/api/v1/estudantes/<id>"
```
