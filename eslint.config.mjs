import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        // jQuery
        $: "readonly",
        jQuery: "readonly",
        // Node.js/CommonJS
        module: "readonly",
        require: "readonly",
        exports: "writable",
        // Variáveis globais do projeto
        salasCadastradas: "writable",
        agendamentos: "writable",
        salasPorBloco: "readonly",
        dataHandler: "readonly",
        // Funções do logica.js
        validarCadastroSala: "readonly",
        adicionarSala: "readonly",
        removerSala: "readonly",
        validarAgendamento: "readonly",
        adicionarAgendamento: "readonly",
        removerAgendamento: "readonly",
        filtrarSalas: "readonly",
        filtrarAgendamentos: "readonly",
        ordenarAgendamentos: "readonly",
        verificarPeriodo: "readonly",
        getDiaSemana: "readonly",
        gerarCorAleatoria: "readonly",
        // Funções do persistencia.js
        carregarSalasCadastradas: "readonly",
        salvarSalasCadastradas: "readonly",
        carregarAgendamentos: "readonly",
        salvarAgendamentos: "readonly",
        // Funções do dom.js
        atualizarTabelaSemanal: "readonly",
        cadastroSalas: "readonly",
        abrirModalAgendamento: "readonly",
        consultarCadastros: "readonly",
        filtrarCadastros: "readonly",
        atualizarSalas: "readonly",
        excluirSala: "readonly",
        excluirAgendamento: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { 
        "varsIgnorePattern": "^(cadastroSalas|abrirModalAgendamento|consultarCadastros|filtrarCadastros|atualizarSalas|excluirSala|excluirAgendamento|salvarSalasCadastradas|salvarAgendamentos|dataHandler)$",
        "argsIgnorePattern": "^_|event"
      }]
    }
  }
];
