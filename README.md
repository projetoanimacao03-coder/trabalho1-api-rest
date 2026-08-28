# Trabalho 1: API REST (Gestão de Estudantes)

## Descrição do Domínio
Esta é uma API RESTful para um sistema de gestão educacional focado em Estudantes. O sistema permite o gerenciamento completo de alunos (CRUD), cadastro de cursos oferecidos pela instituição e o controle de matrículas (relação entre alunos e cursos).

## Tecnologias Utilizadas
- Node.js
- Express
- Swagger (OpenAPI 3.x)
- uuid (Para geração de IDs únicos)

## Como Instalar e Executar

1. Clone este repositório:
   \`\`\`bash
   git clone https://github.com/projetoanimacao03-coder/trabalho1-api-rest.git
   \`\`\`
2. Acesse a pasta do projeto:
   \`\`\`bash
   cd trabalho1-api-rest
   \`\`\`
3. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`
4. Execute o servidor em modo de desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Acesse a documentação interativa Swagger na URL:
   \`http://localhost:3000/docs\`

## Lista de Endpoints Principais
Todas as rotas possuem o prefixo \`/api/v1\` (Versionamento aplicado).

- **GET /estudantes** - Lista estudantes (suporta paginação `?page=1&limit=10` e filtros `?nome=João`).
- **GET /estudantes/:id** - Busca um estudante específico.
- **POST /estudantes** - Cadastra um estudante (retorna 400 em caso de erro de validação).
- **PUT /estudantes/:id** - Substitui os dados completos.
- **PATCH /estudantes/:id** - Atualiza parcialmente (ex: mudar status).
- **DELETE /estudantes/:id** - Remove (Retorna 204).
- **GET /cursos** - Lista os cursos disponíveis.
- **POST /estudantes/:id/matriculas** - Realiza a matrícula do aluno em um curso.