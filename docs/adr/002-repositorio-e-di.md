# ADR 002: Repository e injecao de dependencia

## Contexto

O Prisma e necessario para persistencia PostgreSQL, mas testes de regra de negocio nao devem subir banco nem conhecer o ORM.

## Decisao

Services recebem repositories no construtor. O adapter Prisma e usado em producao e `EmprestimoEmMemoriaRepository` e usado nos testes, ambos com o mesmo contrato comportamental.

## Consequencias

A persistencia pode ser trocada sem alterar dominio ou service. Existe uma pequena responsabilidade adicional no container, que passa a ser o unico ponto de montagem das dependencias.
