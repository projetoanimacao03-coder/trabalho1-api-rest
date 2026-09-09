const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.matricula.deleteMany();
    await tx.emprestimo.deleteMany();
    await tx.categoriaLivro.deleteMany();
    await tx.categoria.deleteMany();
    await tx.livro.deleteMany();
    await tx.curso.deleteMany();
    await tx.estudante.deleteMany();

    const estudantes = await Promise.all(Array.from({ length: 10 }, (_, index) => tx.estudante.create({
      data: { nome: `Estudante ${index + 1}`, email: `estudante${index + 1}@email.com` }
    })));
    const cursos = await Promise.all(Array.from({ length: 10 }, (_, index) => tx.curso.create({
      data: { nome: `Curso ${index + 1}`, cargaHoraria: 40 + index }
    })));
    const categorias = await Promise.all(Array.from({ length: 10 }, (_, index) => tx.categoria.create({
      data: { nome: `Categoria ${index + 1}` }
    })));
    const livros = await Promise.all(Array.from({ length: 10 }, (_, index) => tx.livro.create({
      data: { titulo: `Livro ${index + 1}`, disponivel: 5 }
    })));

    await Promise.all(estudantes.map((estudante, index) => tx.matricula.create({
      data: { estudanteId: estudante.id, cursoId: cursos[index].id }
    })));
    await Promise.all(livros.flatMap((livro, index) => [
      tx.categoriaLivro.create({ data: { livroId: livro.id, categoriaId: categorias[index].id } }),
      tx.categoriaLivro.create({ data: { livroId: livro.id, categoriaId: categorias[(index + 1) % categorias.length].id } })
    ]));
    await Promise.all(estudantes.map((estudante, index) => tx.emprestimo.create({
      data: { estudanteId: estudante.id, livroId: livros[index].id }
    })));
    await tx.livro.updateMany({ data: { disponivel: { decrement: 1 } } });
  });

  console.log('Seed concluído: 10 estudantes, cursos, livros e categorias, além de matrículas, vínculos e empréstimos.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
