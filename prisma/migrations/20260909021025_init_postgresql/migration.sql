-- CreateTable
CREATE TABLE "Estudante" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Estudante_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Matricula" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "dataMatricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Livro" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "disponivel" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Livro_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CategoriaLivro" (
    "livroId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    CONSTRAINT "CategoriaLivro_pkey" PRIMARY KEY ("livroId", "categoriaId")
);

CREATE TABLE "Emprestimo" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "livroId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Emprestimo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Estudante_email_key" ON "Estudante"("email");
CREATE UNIQUE INDEX "Matricula_estudanteId_cursoId_key" ON "Matricula"("estudanteId", "cursoId");
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");

ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CategoriaLivro" ADD CONSTRAINT "CategoriaLivro_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CategoriaLivro" ADD CONSTRAINT "CategoriaLivro_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Emprestimo" ADD CONSTRAINT "Emprestimo_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Emprestimo" ADD CONSTRAINT "Emprestimo_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
