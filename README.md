# Trabalho 4 — Acervo ao Vivo

Aplicação web para acompanhar livros e empréstimos de uma biblioteca educacional. Inclui interface HTML/CSS/JavaScript, API REST em Node.js/Express, PostgreSQL com Prisma e notificações em tempo real com Socket.IO.

Este guia é voltado a quem acabou de baixar o repositório e quer executar o projeto no próprio computador.

## O que você precisa

- Git.
- Node.js 20 ou superior (inclui npm).
- Um PostgreSQL local **ou** Podman Desktop com máquina e provedor Compose configurados.
- Insomnia, caso queira testar a API com uma coleção de requisições.

Não é necessário instalar Docker Desktop: os comandos de containerização deste guia usam Podman.

## 1. Baixe o projeto

Abra PowerShell na pasta onde deseja guardar o projeto:

```powershell
git clone https://github.com/projetoanimacao03-coder/trabalho1-api-rest.git
cd trabalho1-api-rest
npm install
```

## 2. Escolha como executar o PostgreSQL

Use **uma** das opções abaixo.

### Opção A — PostgreSQL em container Podman (recomendado)

Instale e abra o [Podman Desktop](https://podman-desktop.io/). No PowerShell, verifique a máquina e o provedor Compose:

```powershell
podman machine list
podman machine start
podman compose version
```

Se ainda não houver uma máquina Podman, crie-a e inicie-a:

```powershell
podman machine init
podman machine start
```

Se `podman compose version` indicar que não há provedor Compose, habilite/instale o provedor nas configurações do Podman Desktop e tente novamente.

Crie seu arquivo local de configuração sem substituir um arquivo `.env` que já exista:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

No `.env`, escolha uma senha local e coloque o mesmo valor em `POSTGRES_PASSWORD` e na senha dentro de `DATABASE_URL`. Use uma senha sem `@`, `/`, `:`, `#` para evitar problemas de codificação na URL. Preserve o nome de banco e o usuário configurados no arquivo.

Suba o banco e a API:

```powershell
podman compose up --build -d
podman compose ps
podman compose logs --tail 50 api
```

O serviço da API aplica as migrations na inicialização. Confirme que o banco e a API estão ativos:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Uma resposta `status: ok` indica que a API está disponível.

### Opção B — PostgreSQL já instalado no computador

No pgAdmin, crie ou escolha um banco de dados e confirme o nome, o usuário, a senha e a porta do servidor PostgreSQL. Por padrão, o PostgreSQL usa a porta `5432`.

Crie a configuração local:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Edite `DATABASE_URL` com os dados do seu PostgreSQL, no formato:

```text
postgresql://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO?schema=public
```

Edite `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD` também, se for usar esses valores mais tarde com Podman. Para esta opção, a API usa `DATABASE_URL` e você **não** precisa iniciar um banco com `podman compose`.

Gere o cliente Prisma e crie as tabelas no banco selecionado:

```powershell
npx prisma generate
npm run migrate:deploy
```

> **Atenção:** as migrations criam/alteram tabelas no banco indicado por `DATABASE_URL`. Confira o nome do banco antes de executá-las.

## 3. (Opcional) Carregue os dados de demonstração

Se estiver usando um banco novo e vazio, você pode inserir os registros de demonstração:

Com Podman:

```powershell
podman compose exec api npm run prisma:seed
```

Com PostgreSQL local:

```powershell
npm run prisma:seed
```

**O seed apaga os registros existentes das tabelas do projeto e cria dados de exemplo. Não o execute em um banco com informações que queira preservar.**

## 4. Abra o front-end

Se escolheu **Podman**, deixe os containers ativos e abra um novo PowerShell na pasta do projeto. Se escolheu **PostgreSQL local**, inicie primeiro a API no PowerShell:

```powershell
npm start
```

Mantenha essa janela aberta. Em outra janela PowerShell, inicie o servidor do front-end:

```powershell
npm run frontend:dev
```

Abra **http://localhost:5500** no navegador. O front-end local se conecta à API em `http://localhost:3000`; deve aparecer o estado de conexão em tempo real e, quando houver registros, a lista de estudantes, livros e empréstimos.

Para testar a sincronização, abra a página em duas janelas do navegador. Registre um empréstimo ou devolução em uma janela e confira a atualização ao vivo na outra.

O front-end permite:

- cadastrar estudantes e livros;
- registrar empréstimos e devoluções;
- consultar disponibilidade dos livros e empréstimos ativos;
- receber atualizações pelo WebSocket quando os registros mudam.

## 5. Teste a API no Insomnia

O projeto disponibiliza:

- Saúde da API: `http://localhost:3000/health`
- Documentação Swagger: `http://localhost:3000/docs`
- Endpoints REST: `http://localhost:3000/api/v1`

No Insomnia, importe o arquivo `Insomnia_2026-08-28-12-13-32.yaml` da pasta do projeto. O ambiente inicial usa `http://localhost:3000`. Para requisições que dependem de IDs, execute primeiro as criações ou use IDs retornados pelo seed.

Principais recursos:

| Recurso | Endpoints |
|---|---|
| Estudantes | `GET/POST /estudantes`; `GET/PUT/PATCH/DELETE /estudantes/:id` |
| Cursos | `GET/POST /cursos`; `GET/PUT/PATCH/DELETE /cursos/:id` |
| Matrículas | `GET/POST /estudantes/:idEstudante/matriculas`; `GET /matriculas`; `GET/DELETE /matriculas/:id` |
| Livros | `GET/POST /livros`; `GET/PUT/PATCH/DELETE /livros/:id` |
| Categorias | `GET/POST /categorias`; `GET/PATCH/DELETE /categorias/:id`; `POST /categorias/:id/livros` |
| Empréstimos | `GET/POST /emprestimos`; `GET /emprestimos/:id`; `POST /emprestimos/:id/devolucao` |

Exemplo de listagem paginada de empréstimos ativos:

```text
GET http://localhost:3000/api/v1/emprestimos?ativo=true&ordenar=data&direcao=desc&page=1&limit=10
```

## 6. Eventos em tempo real

O Socket.IO usa o mesmo servidor e endereço da API. O front-end entra automaticamente na sala `biblioteca` e escuta os eventos de empréstimo, devolução e disponibilidade.

Clientes Socket.IO podem enviar:

| Evento | Payload |
|---|---|
| `biblioteca:entrar` / `biblioteca:sair` | Sem payload |
| `livro:acompanhar` / `livro:parar` | `{ "livroId": "<UUID>" }` |
| `emprestimo:acompanhar` / `emprestimo:parar` | `{ "emprestimoId": "<UUID>" }` |

O servidor emite, entre outros, `conexao:estado`, `emprestimo:criado`, `emprestimo:devolvido`, `livro:disponibilidade` e `biblioteca:atualizacao`. Entradas e UUIDs são validados pelo servidor.

## 7. Testes

Os testes automatizados não precisam de conexão com o PostgreSQL:

```powershell
npm test
npm run lint
```

## 8. Parar os serviços

Para parar a API e o front-end iniciados diretamente, pressione `Ctrl+C` nas respectivas janelas.

Para parar os containers Podman e preservar os dados:

```powershell
podman compose down
```

Para remover também o volume do banco Podman, apagando permanentemente os dados:

```powershell
podman compose down -v
```

## Publicação opcional

O front-end estático pode ser publicado no GitHub Pages; a API e o PostgreSQL precisam estar disponíveis em um servidor acessível por HTTPS/WSS. O repositório inclui `render.yaml` para criar a API e o banco no Render e um workflow para publicar o diretório `frontend`.

Para Pages, configure a origem **GitHub Actions** em **Settings → Pages** e adicione a variável `API_BASE_URL` em **Settings → Secrets and variables → Actions → Variables**, com a URL HTTPS pública da API. O workflow publica o front-end quando há alterações nele na branch `main`.

Este projeto acadêmico não implementa autenticação: CORS limita origens de navegador, mas não impede chamadas diretas à API. Use dados fictícios; não publique nem insira dados pessoais ou sensíveis.

## Estrutura do projeto

- `frontend/`: interface web e servidor estático para desenvolvimento local.
- `src/routes`, `src/controllers`, `src/services`, `src/repositories`: API organizada em camadas.
- `src/realtime/`: servidor Socket.IO e notificações após persistência.
- `prisma/schema.prisma`: modelos PostgreSQL.
- `prisma/migrations/`: histórico de alterações do banco.
- `prisma/seed.js`: dados de demonstração.
- `compose.yaml`, `Dockerfile`: execução com Podman Compose.
- `Insomnia_2026-08-28-12-13-32.yaml`: coleção de requisições REST.
- `ARQUITETURA.md`, `docs/adr/`: documentação de arquitetura e decisões.