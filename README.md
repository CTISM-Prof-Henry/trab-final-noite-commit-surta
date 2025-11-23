[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/BJmkW5Ih)

# Agendamento Politécnico

Sistema de agendamento de salas para o Colégio Politécnico da UFSM.

##  Funcionalidades

-  **Cadastro de Salas**: Gerenciamento completo de salas por bloco
-  **Agendamento**: Sistema de reservas com validação de conflitos
-  **Filtros**: Busca por bloco, tipo, capacidade, responsável e período
-  **Tabela Semanal**: Visualização de horários ocupados
-  **Persistência Híbrida**: IndexedDB com fallback para localStorage
-  **Testes Automatizados**: 25 testes com QUnit

##  Estrutura do Projeto

```
JavaScript/
├── logica.js       - Funções puras testáveis (validações, filtros)
├── persistencia.js - Gerenciamento de dados (localStorage + IndexedDB)
├── indexeddb.js    - Implementação completa do IndexedDB
└── dom.js          - Manipulação da interface

test/
└── script.test.js  - 25 testes automatizados

docs/               - Documentação MkDocs
```

##  Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Framework CSS**: Bootstrap 4.1.3
- **Ícones**: Font Awesome 5.15.4
- **Persistência**: IndexedDB + localStorage
- **Testes**: QUnit
- **Linter**: ESLint
- **Documentação**: MkDocs

##  Instruções de Uso

### Usar o Sistema

1. Abra `index.html` no navegador
2. Cadastre salas através do modal "Cadastro de Salas"
3. Faça agendamentos com validação automática
4. Consulte a tabela semanal de ocupação

### Rodar Testes

```bash
npm install
npm test
```

### Gerar Documentação

```bash
mkdocs serve
```

Acesse: http://localhost:8000

### Site de Documentação

https://ctism-prof-henry.github.io/trab-final-noite-commit-surta/

## Regras de Negócio

-  Não pode agendar para hoje (apenas amanhã em diante)
-  Não pode agendar aos sábados e domingos
-  Não pode duplicar salas no mesmo bloco
-  Não pode ter conflito de horários na mesma sala
-  Validação de horários (final > inicial)
-  Auditório limitado a 100 pessoas

##  Contato

Projeto desenvolvido por:

* **Anderson da Silva Rossini** - anderson.silvarossini@gmail.com
* **Erick Posser Mathias** - possermathiasb@gmail.com

---

**Colégio Politécnico da UFSM** - Trabalho Final de Desenvolvimento de Software




