-- Evolution: status, loan return tracking, and query indexes.
ALTER TABLE "Estudante" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ativo';
ALTER TABLE "Emprestimo" ADD COLUMN "devolvidoEm" TIMESTAMP(3);

CREATE INDEX "Estudante_nome_idx" ON "Estudante"("nome");
CREATE INDEX "Estudante_status_idx" ON "Estudante"("status");
CREATE INDEX "Curso_nome_idx" ON "Curso"("nome");
CREATE INDEX "Livro_titulo_idx" ON "Livro"("titulo");
CREATE INDEX "Livro_disponivel_idx" ON "Livro"("disponivel");
CREATE INDEX "Categoria_nome_idx" ON "Categoria"("nome");
CREATE INDEX "Emprestimo_estudanteId_idx" ON "Emprestimo"("estudanteId");
CREATE INDEX "Emprestimo_livroId_idx" ON "Emprestimo"("livroId");
CREATE INDEX "Emprestimo_devolvidoEm_idx" ON "Emprestimo"("devolvidoEm");
