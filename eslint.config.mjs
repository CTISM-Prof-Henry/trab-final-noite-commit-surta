import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

// Configuração simples focada em JavaScript (projeto não usa React)
export default defineConfig([
  {
    ignores: ["site/**", "node_modules/**", "**/*.min.js"],
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        $: 'readonly',
        jQuery: 'readonly',
        salasCadastradas: 'writable',
        agendamentos: 'writable',
        dataHandler: 'writable',
        cadastroSalas: 'readonly',
        abrirModalAgendamento: 'readonly',
        consultarCadastros: 'readonly',
        filtrarSalas: 'readonly',
        filtrarCadastros: 'readonly',
        filtrarAgendamentos: 'readonly',
        ordenarAgendamentos: 'readonly',
        atualizarTabelaSemanal: 'readonly',
        atualizarSalas: 'readonly',
        salasPorBloco: 'readonly',
        gerarCorAleatoria: 'readonly',
        validarCadastroSala: 'readonly',
        adicionarSala: 'readonly',
        salvarSalasCadastradas: 'readonly',
        validarAgendamento: 'readonly',
        adicionarAgendamento: 'readonly',
        salvarAgendamentos: 'readonly',
        removerSala: 'readonly',
        removerAgendamento: 'readonly',
        carregarSalasCadastradas: 'readonly',
        carregarAgendamentos: 'readonly',
        module: 'writable',
        require: 'readonly',
        exports: 'writable',
      }
    },
  },
  // Desativar regra no-unused-vars em arquivos que expõem funções para o HTML
  {
    files: ["JavaScript/dom.js", "JavaScript/persistenciaDados.js", "JavaScript/indexeddb.js", "JavaScript/index.js"],
    rules: {
      'no-unused-vars': 'off'
    }
  },
  // Configurações específicas para os testes QUnit
  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        QUnit: 'readonly',
        global: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off'
    }
  }
]);
