<div align="center">

# Sistema de Agendamento Politécnico

### Plataforma Web para Gestão de Salas e Recursos Educacionais

[![Review Assignment](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/BJmkW5Ih)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-25%20passing-success)](./test/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

[Documentação](https://ctism-prof-henry.github.io/trab-final-noite-commit-surta/) • [Reportar Bug](https://github.com/CTISM-Prof-Henry/trab-final-noite-commit-surta/issues) • [Solicitar Feature](https://github.com/CTISM-Prof-Henry/trab-final-noite-commit-surta/issues)

</div>

---

## Sobre o Projeto

O **Sistema de Agendamento Politécnico** é uma aplicação web desenvolvida para otimizar o gerenciamento de salas e recursos do Colégio Politécnico da UFSM. A plataforma oferece uma interface intuitiva para cadastro, reserva e visualização de ocupação de espaços físicos, com validações robustas e persistência de dados local.

### Principais Características

- **Gestão Completa de Salas**: Cadastro e organização por blocos com controle de capacidade e tipo
- **Sistema de Reservas Inteligente**: Agendamento com validação automática de conflitos de horário
- **Visualização em Tempo Real**: Tabela semanal interativa mostrando ocupação de todas as salas
- **Busca Avançada**: Filtros por bloco, tipo, capacidade, responsável e período (manhã/tarde/noite)
- **Persistência Robusta**: Armazenamento híbrido usando IndexedDB com fallback para localStorage
- **Código Testado**: Cobertura de testes automatizados com 25 casos de teste

---

## Demonstração

Acesse a aplicação em produção: **[https://ctism-prof-henry.github.io/trab-final-noite-commit-surta/](https://ctism-prof-henry.github.io/trab-final-noite-commit-surta/)**

---

## Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização e responsividade
- **JavaScript ES6+** - Lógica de negócio e interatividade
- **Bootstrap 4.1.3** - Framework CSS para interface responsiva
- **Font Awesome 5.15.4** - Biblioteca de ícones

### Persistência de Dados
- **IndexedDB** - Banco de dados NoSQL do navegador (principal)
- **localStorage** - Armazenamento de backup e fallback

### Qualidade de Código
- **ESLint** - Análise estática de código
- **QUnit** - Framework de testes unitários
- **MkDocs** - Geração de documentação

### Arquitetura
- **Separação de Concerns** - Lógica, persistência e DOM em módulos independentes
- **Padrão MVC** - Organização clara de responsabilidades
- **Test-Driven Development** - Funções testáveis isoladas

---

## Estrutura do Projeto

```
trab-final-noite-commit-surta/
│
├── JavaScript/
│   ├── logica.js           # Funções puras (validações, filtros, regras de negócio)
│   ├── persistencia.js     # Camada de persistência (localStorage + IndexedDB)
│   ├── indexeddb.js        # Implementação completa do IndexedDB
│   └── dom.js              # Manipulação da interface e eventos
│
├── test/
│   └── script.test.js      # 25 testes automatizados com QUnit
│
├── Css/
│   └── index.css           # Estilos personalizados
│
├── docs/                   # Documentação do projeto (MkDocs)
│   ├── index.md
│   ├── tutorial.md
│   └── ...
│
├── Imgs/                   # Recursos de imagem
├── site/                   # Site estático gerado pelo MkDocs
├── index.html              # Página principal da aplicação
├── package.json            # Dependências e scripts npm
├── eslint.config.mjs       # Configuração do ESLint
└── README.md               # Este arquivo
```

---

## Instalação e Configuração

### Pré-requisitos

- **Navegador moderno** (Chrome, Firefox, Edge, Safari)
- **Node.js 14+** (para executar testes e ferramentas de desenvolvimento)
- **Python 3.8+** (para geração de documentação com MkDocs)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/CTISM-Prof-Henry/trab-final-noite-commit-surta.git
   cd trab-final-noite-commit-surta
   ```

2. **Instale as dependências Node.js**
   ```bash
   npm install
   ```

3. **Instale as dependências Python (opcional, para documentação)**
   ```bash
   pip install -r requirements.txt
   ```

### Executar a Aplicação

Abra o arquivo `index.html` diretamente no navegador ou use um servidor local:

```bash
# Usando Python
python -m http.server 8000

# Usando Node.js (http-server)
npx http-server
```

Acesse: `http://localhost:8000`

### Executar Testes

```bash
npm test
```

### Gerar Documentação

```bash
mkdocs serve
```

Acesse: `http://localhost:8000`

---

## Como Usar

### 1. Cadastrar uma Sala

1. Clique no botão **"Cadastrar Salas"**
2. Preencha os campos:
   - Bloco (A, B, C, etc.)
   - Número da sala
   - Capacidade (número de pessoas)
   - Tipo (Sala de Aula, Laboratório, Auditório)
3. Clique em **"Salvar"**

### 2. Fazer um Agendamento

1. Clique no botão **"Fazer Agendamento"**
2. Preencha os dados:
   - Selecione bloco e sala
   - Data inicial e final
   - Horário de início e término
   - CPF, nome e disciplina do responsável
3. Clique em **"Confirmar Agendamento"**

### 3. Consultar Agendamentos

- Visualize a **tabela semanal** na página principal
- Use **"Consultar Agendamentos"** para filtros avançados
- Filtre por responsável, bloco ou período

### 4. Gerenciar Cadastros

- Acesse **"Consultar Cadastros"** para ver todas as salas
- Aplique filtros por bloco, tipo ou capacidade mínima
- Exclua salas diretamente dos cards

---

## Regras de Negócio

### Validações de Agendamento

| Regra | Descrição |
|-------|-----------|
| Dia atual | Agendamentos permitidos apenas a partir de amanhã |
| Fins de semana | Não é possível agendar aos sábados e domingos |
| Horários | Horário final deve ser posterior ao inicial |
| Conflitos | Não permite agendamentos simultâneos na mesma sala |
| Auditório | Capacidade máxima limitada a 100 pessoas |

### Validações de Cadastro

- Salas não podem ser duplicadas no mesmo bloco
- Capacidade mínima de 1 pessoa
- Todos os campos são obrigatórios
- Tipos válidos: Sala de Aula, Laboratório, Auditório

---

## Testes

O projeto possui **25 testes automatizados** cobrindo:

- **7 testes** de cadastro de salas
- **8 testes** de validação de agendamentos
- **4 testes** de verificação de períodos
- **4 testes** de filtros e buscas
- **2 testes** de funções utilitárias

### Executar Testes

```bash
npm test
```

Resultado esperado: `25 passing`

---

## Autores

<table>
  <tr>
    <td align="center">
      <a href="mailto:anderson.silvarossini@gmail.com">
        <img src="https://ui-avatars.com/api/?name=Anderson+Rossini&background=0D2E6D&color=fff&size=100" width="100px;" alt="Anderson Rossini"/><br />
        <sub><b>Anderson da Silva Rossini</b></sub>
      </a><br />
      <a href="mailto:anderson.silvarossini@gmail.com">Email</a>
    </td>
    <td align="center">
      <a href="mailto:possermathiasb@gmail.com">
        <img src="https://ui-avatars.com/api/?name=Erick+Mathias&background=0D2E6D&color=fff&size=100" width="100px;" alt="Erick Mathias"/><br />
        <sub><b>Erick Posser Mathias</b></sub>
      </a><br />
      <a href="mailto:possermathiasb@gmail.com">Email</a>
    </td>
  </tr>
</table>

---

## Instituição

<div align="center">

**Colégio Politécnico da Universidade Federal de Santa Maria**

Trabalho Final de Desenvolvimento de Software

Professor: Henry Cagnini

2025

</div>

---

<div align="center">

</div>
