# ADR 001: Arquitetura em camadas + MVC

## Contexto

A API funcionava, mas os controladores acessavam repositories diretamente. Isso misturava traducao HTTP com orquestracao e dificultava testar regras sem PostgreSQL.

## Decisao

Adotar camadas `routes -> controllers -> services -> repositories`, com `config/container.js` como composition root.

## Consequencias

Controllers ficam menores, services podem ser testados com doubles e o contrato HTTP existente permanece estavel. A equipe precisa respeitar a regra de nao pular camadas.
