const { JSDOM } = require("jsdom");

// Simular localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  clear() {
    this.store = {};
  }
};

// Configuração do ambiente de teste
QUnit.module("Sistema de Agendamento", hooks => {
  let dom, document, window;

  hooks.beforeEach(() => {
    // Criar DOM com todos os elementos necessários
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <!-- Modal de Cadastro -->
          <div id="modalum">
            <form>
              <select id="bloco">
                <option value="">Selecione</option>
                <option value="Bloco A">Bloco A</option>
                <option value="Bloco C">Bloco C</option>
              </select>
              <select id="sala"></select>
              <input type="number" id="capacidade" value="30">
              <select id="tipo">
                <option value="Laboratório">Laboratório</option>
              </select>
            </form>
          </div>

          <!-- Modal de Agendamento -->
          <div id="modalAgendamento">
            <form>
              <select id="blocoAgendamento"></select>
              <select id="salaAgendamento"></select>
              <select id="tipoAgendamento"></select>
              <input type="date" id="dataInicialAgendamento">
              <input type="date" id="dataFinalAgendamento">
              <input type="time" id="horaInicialAgendamento">
              <input type="time" id="horaFinalAgendamento">
              <input type="text" id="cpfAgendamento">
              <input type="text" id="nomeAgendamento">
              <input type="text" id="disciplinaAgendamento">
              <input type="number" id="capacidadeAgendamento">
            </form>
          </div>

          <!-- Modal de Consulta -->
          <div id="modaltres">
            <div class="modal-body">
              <div class="form-row">
                <select id="filtroBloco"></select>
                <select id="filtroTipo"></select>
                <input type="number" id="filtroCapacidade">
              </div>
            </div>
          </div>

          <!-- Modal de Agendamentos -->
          <div id="modaldois">
            <div class="cards-container"></div>
            <input type="text" id="filtroResponsavel">
            <select id="filtroBlocoAgendamento"></select>
            <select id="filtroPeriodoAgendamento"></select>
          </div>

          <!-- Tabela Semanal -->
          <div class="table-responsive"></div>
        </body>
      </html>
    `);

    document = dom.window.document;
    window = dom.window;

    // Simular ambiente do navegador
    global.document = document;
    global.window = window;
    global.localStorage = localStorageMock;

    // Simular jQuery
    global.$ = function(selector) {
      return {
        modal: function() {},
        on: function() {}
      };
    };

    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  // 1. Testes de Cadastro de Salas
  QUnit.test("Deve cadastrar uma sala corretamente", assert => {
    const { cadastrarSala } = require("../JavaScript/index.js");
    
    // Simular evento de form
    const event = { preventDefault: () => {} };
    
    // Preencher campos
    document.getElementById("bloco").value = "Bloco A";
    document.getElementById("sala").value = "A1";
    document.getElementById("capacidade").value = "30";
    document.getElementById("tipo").value = "Laboratório";

    // Executar cadastro
    cadastrarSala(event);

    // Verificar localStorage
    const salas = JSON.parse(localStorage.getItem("salasCadastradas") || "[]");
    assert.equal(salas.length, 1, "Uma sala foi cadastrada");
    assert.equal(salas[0].bloco, "Bloco A", "Bloco correto");
    assert.equal(salas[0].capacidade, 30, "Capacidade correta");
  });

  QUnit.test("Não deve cadastrar sala duplicada", assert => {
    const { cadastrarSala } = require("../JavaScript/index.js");
    const event = { preventDefault: () => {} };

    // Primeira tentativa
    document.getElementById("bloco").value = "Bloco A";
    document.getElementById("sala").value = "A1";
    cadastrarSala(event);

    // Segunda tentativa com mesma sala
    cadastrarSala(event);

    const salas = JSON.parse(localStorage.getItem("salasCadastradas") || "[]");
    assert.equal(salas.length, 1, "Apenas uma sala foi cadastrada");
  });

  // 2. Testes de Agendamento
  QUnit.test("Deve realizar um agendamento válido", assert => {
    const { realizarAgendamento } = require("../JavaScript/index.js");
    const event = { preventDefault: () => {} };

    // Configurar data futura
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataStr = amanha.toISOString().split('T')[0];

    // Preencher campos
    document.getElementById("blocoAgendamento").value = "Bloco A";
    document.getElementById("salaAgendamento").value = "A1";
    document.getElementById("dataInicialAgendamento").value = dataStr;
    document.getElementById("dataFinalAgendamento").value = dataStr;
    document.getElementById("horaInicialAgendamento").value = "08:00";
    document.getElementById("horaFinalAgendamento").value = "09:00";
    document.getElementById("disciplinaAgendamento").value = "Matemática";
    document.getElementById("nomeAgendamento").value = "Professor Teste";
    document.getElementById("cpfAgendamento").value = "123.456.789-00";

    realizarAgendamento(event);

    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    assert.equal(agendamentos.length, 1, "Um agendamento foi criado");
    assert.equal(agendamentos[0].disciplina, "Matemática", "Disciplina correta");
  });

  QUnit.test("Não deve permitir agendamento em data passada", assert => {
    const { realizarAgendamento } = require("../JavaScript/index.js");
    const event = { preventDefault: () => {} };

    // Configurar data passada
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataStr = ontem.toISOString().split('T')[0];

    document.getElementById("dataInicialAgendamento").value = dataStr;
    realizarAgendamento(event);

    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    assert.equal(agendamentos.length, 0, "Não deve criar agendamento em data passada");
  });

  // 3. Testes de Filtros
  QUnit.test("Deve filtrar agendamentos por período", assert => {
    const { verificarPeriodo } = require("../JavaScript/index.js");

    assert.ok(verificarPeriodo("08:00", "manha"), "Período da manhã correto");
    assert.ok(verificarPeriodo("14:00", "tarde"), "Período da tarde correto");
    assert.ok(verificarPeriodo("19:00", "noite"), "Período da noite correto");
    assert.notOk(verificarPeriodo("08:00", "noite"), "Fora do período noturno");
  });

  QUnit.test("Deve filtrar salas por capacidade", assert => {
    const { cadastrarSala } = require("../JavaScript/index.js");
    const event = { preventDefault: () => {} };

    // Cadastrar salas com diferentes capacidades
    document.getElementById("bloco").value = "Bloco A";
    document.getElementById("sala").value = "A1";
    document.getElementById("capacidade").value = "20";
    cadastrarSala(event);

    document.getElementById("sala").value = "A2";
    document.getElementById("capacidade").value = "40";
    cadastrarSala(event);

    // Filtrar por capacidade
    document.getElementById("filtroCapacidade").value = "30";
    const salas = JSON.parse(localStorage.getItem("salasCadastradas") || "[]");
    const salasFiltradas = salas.filter(s => s.capacidade >= 30);

    assert.equal(salasFiltradas.length, 1, "Apenas uma sala com capacidade maior que 30");
  });

  // 4. Testes da Tabela Semanal
  QUnit.test("Deve gerar tabela com horários corretos", assert => {
    const { atualizarTabelaSemanal } = require("../JavaScript/index.js");

    atualizarTabelaSemanal();
    const tabela = document.querySelector(".table-responsive table");
    
    assert.ok(tabela, "Tabela foi criada");
    const horarios = tabela.querySelectorAll("tbody tr");
    assert.ok(horarios.length > 0, "Horários foram gerados");
  });
});
