// Simular localStorage para os testes
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

/**
 * Função auxiliar para obter a próxima data de um dia da semana específico
 * 
 * @param {number} diaSemana - Número do dia da semana desejado
 *                             0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta,
 *                             4 = Quinta, 5 = Sexta, 6 = Sábado
 * @returns {string} Data no formato YYYY-MM-DD (ex: "2025-12-06")
 * 
 * Exemplo de uso:
 *   const proximoSabado = getProximaData(6);  // Retorna a data do próximo sábado
 *   const proximoDomingo = getProximaData(0); // Retorna a data do próximo domingo
 */
function getProximaData(diaSemana) {
  // Obtém a data atual e zera as horas para trabalhar apenas com datas
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zera horas, minutos, segundos e milissegundos
  
  // Começa a buscar a partir de 2 dias no futuro
  // Isso evita conflitos com validações que bloqueiam "hoje" e "amanhã"
  let diasParaAdicionar = 2;
  
  // Cria uma nova data somando os dias
  let dataFutura = new Date(hoje);
  dataFutura.setDate(hoje.getDate() + diasParaAdicionar);
  
  // Continua adicionando dias até encontrar o dia da semana desejado
  // getDay() retorna 0-6 onde 0=Domingo, 1=Segunda, ..., 6=Sábado
  while (dataFutura.getDay() !== diaSemana) {
    diasParaAdicionar++; // Incrementa o contador
    dataFutura = new Date(hoje); // Recria o objeto Date
    dataFutura.setDate(hoje.getDate() + diasParaAdicionar); // Adiciona os dias
  }
  
  // Formata a data no formato YYYY-MM-DD para compatibilidade com input type="date"
  const ano = dataFutura.getFullYear(); // Ex: 2025
  const mes = String(dataFutura.getMonth() + 1).padStart(2, '0'); // Ex: "12" (getMonth() retorna 0-11)
  const dia = String(dataFutura.getDate()).padStart(2, '0'); // Ex: "06" (padStart garante 2 dígitos)
  
  return `${ano}-${mes}-${dia}`; // Retorna a string formatada: "2025-12-06"
}

// Importar funções do arquivo de lógica
const {
  validarCadastroSala,
  validarAgendamento,
  filtrarSalas,
  filtrarAgendamentos,
  verificarPeriodo,
  getDiaSemana,
  adicionarSala,
  adicionarAgendamento,
  removerSala,
  removerAgendamento,
  salasCadastradas,
  agendamentos
} = require("../JavaScript/logica.js");

// Configuração dos testes
QUnit.module("Testes do Sistema de Agendamento", hooks => {
  
  hooks.beforeEach(() => {
    // Configurar localStorage simulado
    global.localStorage = localStorageMock;
    localStorage.clear();
    
    // Limpar arrays globais
    salasCadastradas.length = 0;
    agendamentos.length = 0;
  });

  // ========== TESTES DE CADASTRO DE SALAS ==========
  
  QUnit.test("Teste 1: Validar cadastro de sala com dados corretos", assert => {
    // Dados de uma sala válida
    const bloco = "Bloco A";
    const sala = "A101";
    const capacidade = 30;
    const tipo = "Laboratório";
    
    // Chamar função de validação
    const resultado = validarCadastroSala(bloco, sala, capacidade, tipo, salasCadastradas);
    
    // Verificar se a validação passou
    assert.ok(resultado.valido, "Sala válida deve ser aceita");
  });
  
  QUnit.test("Teste 2: Não permitir cadastro sem bloco", assert => {
    // Dados sem bloco
    const bloco = "";
    const sala = "A101";
    const capacidade = 30;
    const tipo = "Laboratório";
    
    // Tentar validar
    const resultado = validarCadastroSala(bloco, sala, capacidade, tipo, salasCadastradas);
    
    // Deve falhar
    assert.notOk(resultado.valido, "Não deve aceitar sala sem bloco");
    assert.ok(resultado.erro.includes("bloco"), "Erro deve mencionar bloco");
  });
  
  QUnit.test("Teste 3: Não permitir cadastro sem sala", assert => {
    const resultado = validarCadastroSala("Bloco A", "", 30, "Laboratório", salasCadastradas);
    
    assert.notOk(resultado.valido, "Não deve aceitar sem número da sala");
    assert.ok(resultado.erro.includes("sala"), "Erro deve mencionar sala");
  });
  
  QUnit.test("Teste 4: Não permitir capacidade menor que 1", assert => {
    const resultado = validarCadastroSala("Bloco A", "A101", 0, "Laboratório", salasCadastradas);
    
    assert.notOk(resultado.valido, "Capacidade zero não é válida");
    assert.ok(resultado.erro.includes("capacidade"), "Erro deve mencionar capacidade");
  });
  
  QUnit.test("Teste 5: Não permitir sala duplicada", assert => {
    // Adicionar uma sala primeiro
    adicionarSala({ bloco: "Bloco A", sala: "A101", capacidade: 30, tipo: "Laboratório" });
    
    // Tentar adicionar a mesma sala
    const resultado = validarCadastroSala("Bloco A", "A101", 25, "Sala de Aula", salasCadastradas);
    
    assert.notOk(resultado.valido, "Não deve permitir sala duplicada");
    assert.ok(resultado.erro.includes("já") || resultado.erro.includes("cadastrada"), "Erro deve indicar duplicação");
  });
  
  QUnit.test("Teste 6: Adicionar sala com sucesso", assert => {
    // Adicionar sala
    adicionarSala({ bloco: "Bloco B", sala: "B202", capacidade: 40, tipo: "Sala de Aula" });
    
    // Verificar se foi adicionada
    assert.equal(salasCadastradas.length, 1, "Deve ter 1 sala cadastrada");
    assert.equal(salasCadastradas[0].bloco, "Bloco B", "Bloco deve ser B");
    assert.equal(salasCadastradas[0].sala, "B202", "Sala deve ser B202");
  });
  
  QUnit.test("Teste 7: Remover sala existente", assert => {
    // Adicionar uma sala
    adicionarSala({ bloco: "Bloco C", sala: "C303", capacidade: 20, tipo: "Laboratório" });
    
    // Remover a sala
    removerSala("Bloco C", "C303");
    
    // Verificar se foi removida
    assert.equal(salasCadastradas.length, 0, "Sala deve ter sido removida");
  });

  // ========== TESTES DE AGENDAMENTO ==========
  
  QUnit.test("Teste 8: Não permitir agendamento para hoje", assert => {
    // Pegar data de hoje
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0];
    
    // Dados do agendamento
    const dados = {
      bloco: "Bloco A",
      sala: "A101",
      dataInicial: dataHoje,
      horaInicial: "08:00",
      horaFinal: "10:00",
      capacidade: 30
    };
    
    // Validar
    const resultado = validarAgendamento(dados, agendamentos);
    
    // Não deve aceitar agendamento para hoje
    assert.notOk(resultado.valido, "Não deve aceitar agendamento para hoje");
    assert.ok(resultado.erro.includes("hoje") || resultado.erro.includes("futura"), "Erro deve mencionar que não pode ser hoje");
  });
  
  QUnit.test("Teste 9: Validar agendamento para dia útil futuro (segunda-feira)", assert => {
    // Usar uma segunda-feira no futuro: 2025-12-01
    const dataSegunda = "2025-12-01";
    
    // Dados do agendamento
    const dados = {
      bloco: "Bloco B",
      sala: "B201",
      dataInicial: dataSegunda,
      horaInicial: "14:00",
      horaFinal: "16:00",
      capacidade: 25
    };
    
    // Validar
    const resultado = validarAgendamento(dados, agendamentos);
    
    assert.ok(resultado.valido, "Deve aceitar agendamento para segunda-feira futura");
  });
  
  QUnit.test("Teste 10: Não permitir agendamento em data passada", assert => {
    // Data de ontem
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataOntem = ontem.toISOString().split('T')[0];
    
    // Dados do agendamento
    const dados = {
      bloco: "Bloco C",
      sala: "C301",
      dataInicial: dataOntem,
      horaInicial: "08:00",
      horaFinal: "10:00",
      capacidade: 30
    };
    
    // Validar
    const resultado = validarAgendamento(dados, agendamentos);
    
    assert.notOk(resultado.valido, "Não deve aceitar data passada");
    assert.ok(resultado.erro.includes("hoje") || resultado.erro.includes("futura"), "Erro deve mencionar data inválida");
  });
  
  QUnit.test("Teste 10b: Não permitir agendamento para sábado", assert => {
    // Calcula automaticamente o próximo sábado (6 representa sábado no JavaScript)
    // Isso garante que o teste sempre use uma data válida de sábado no futuro
    const sabado = getProximaData(6);
    
    const dados = {
      bloco: "Bloco A",
      sala: "A101",
      dataInicial: sabado,
      horaInicial: "08:00",
      horaFinal: "10:00",
      capacidade: 30
    };
    
    const resultado = validarAgendamento(dados, agendamentos);
    
    assert.notOk(resultado.valido, "Não deve aceitar agendamento para sábado");
    assert.ok(resultado.erro.includes("sábado") || resultado.erro.includes("sabado") || resultado.erro.includes("Sábado"), "Erro deve mencionar sábado");
  });
  
  QUnit.test("Teste 10c: Não permitir agendamento para domingo", assert => {
    // Calcula automaticamente o próximo domingo (0 representa domingo no JavaScript)
    // Isso garante que o teste sempre use uma data válida de domingo no futuro
    const domingo = getProximaData(0);
    
    const dados = {
      bloco: "Bloco B",
      sala: "B201",
      dataInicial: domingo,
      horaInicial: "08:00",
      horaFinal: "10:00",
      capacidade: 30
    };
    
    const resultado = validarAgendamento(dados, agendamentos);
    
    assert.notOk(resultado.valido, "Não deve aceitar agendamento para domingo");
    assert.ok(resultado.erro.includes("domingo"), "Erro deve mencionar domingo");
  });
  
  QUnit.test("Teste 11: Não permitir horário final antes do inicial", assert => {
    // Usar uma data de segunda-feira (não domingo)
    const dataSeg = "2025-12-01"; // Segunda-feira
    
    const dados = {
      bloco: "Bloco A",
      sala: "A101",
      dataInicial: dataSeg,
      horaInicial: "10:00",
      horaFinal: "08:00", // Horário final antes do inicial
      capacidade: 30
    };
    
    const resultado = validarAgendamento(dados, agendamentos);
    
    assert.notOk(resultado.valido, "Horário final não pode ser antes do inicial");
    assert.ok(resultado.erro.includes("horário") || resultado.erro.includes("horario") || resultado.erro.includes("posterior"), "Erro deve mencionar horário");
  });
  
  QUnit.test("Teste 12: Adicionar agendamento com sucesso", assert => {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Adicionar agendamento
    adicionarAgendamento({
      bloco: "Bloco D",
      sala: "D401",
      tipo: "Laboratório",
      dataInicial: hoje,
      dataFinal: hoje,
      diaSemana: getDiaSemana(hoje),
      horaInicial: "13:30",
      horaFinal: "15:30",
      cpf: "123.456.789-00",
      nome: "João Silva",
      disciplina: "Programação"
    });
    
    // Verificar
    assert.equal(agendamentos.length, 1, "Deve ter 1 agendamento");
    assert.equal(agendamentos[0].disciplina, "Programação", "Disciplina correta");
    assert.equal(agendamentos[0].nome, "João Silva", "Nome correto");
  });
  
  QUnit.test("Teste 13: Remover agendamento existente", assert => {
    // Adicionar agendamento
    const hoje = new Date().toISOString().split('T')[0];
    
    adicionarAgendamento({
      bloco: "Bloco E",
      sala: "E501",
      tipo: "Sala de Aula",
      dataInicial: hoje,
      dataFinal: hoje,
      diaSemana: getDiaSemana(hoje),
      horaInicial: "08:00",
      horaFinal: "10:00",
      cpf: "987.654.321-00",
      nome: "Maria Santos",
      disciplina: "Matemática"
    });
    
    // Pegar a dataAgendamento que foi adicionada automaticamente
    const dataAgendamento = agendamentos[0].dataAgendamento;
    
    // Remover
    removerAgendamento(dataAgendamento, "E501", "08:00");
    
    // Verificar
    assert.equal(agendamentos.length, 0, "Agendamento deve ter sido removido");
  });

  // ========== TESTES DE PERÍODOS ==========
  
  QUnit.test("Teste 14: Verificar horário da manhã", assert => {
    assert.ok(verificarPeriodo("08:00", "manha"), "08:00 é manhã");
    assert.ok(verificarPeriodo("11:50", "manha"), "11:50 é manhã");
  });
  
  QUnit.test("Teste 15: Verificar horário da tarde", assert => {
    assert.ok(verificarPeriodo("13:30", "tarde"), "13:30 é tarde");
    assert.ok(verificarPeriodo("17:00", "tarde"), "17:00 é tarde");
  });
  
  QUnit.test("Teste 16: Verificar horário da noite", assert => {
    assert.ok(verificarPeriodo("19:00", "noite"), "19:00 é noite");
    assert.ok(verificarPeriodo("22:00", "noite"), "22:00 é noite");
  });
  
  QUnit.test("Teste 17: Horário fora do período", assert => {
    assert.notOk(verificarPeriodo("08:00", "noite"), "08:00 não é noite");
    assert.notOk(verificarPeriodo("20:00", "manha"), "20:00 não é manhã");
  });
  
  // ========== TESTES DE FILTROS ==========
  
  QUnit.test("Teste 18: Filtrar salas por bloco", assert => {
    // Adicionar salas de blocos diferentes
    adicionarSala({ bloco: "Bloco A", sala: "A101", capacidade: 30, tipo: "Laboratório" });
    adicionarSala({ bloco: "Bloco B", sala: "B201", capacidade: 25, tipo: "Sala de Aula" });
    adicionarSala({ bloco: "Bloco A", sala: "A102", capacidade: 40, tipo: "Auditório" });
    
    // Filtrar por Bloco A
    const filtradas = filtrarSalas(salasCadastradas, { bloco: "Bloco A", tipo: "", capacidade: 0 });
    
    assert.equal(filtradas.length, 2, "Deve retornar 2 salas do Bloco A");
  });
  
  QUnit.test("Teste 19: Filtrar salas por tipo", assert => {
    // Adicionar salas de tipos diferentes
    adicionarSala({ bloco: "Bloco C", sala: "C301", capacidade: 30, tipo: "Laboratório" });
    adicionarSala({ bloco: "Bloco C", sala: "C302", capacidade: 25, tipo: "Sala de Aula" });
    adicionarSala({ bloco: "Bloco C", sala: "C303", capacidade: 20, tipo: "Laboratório" });
    
    // Filtrar por Laboratório
    const filtradas = filtrarSalas(salasCadastradas, { bloco: "", tipo: "Laboratório", capacidade: 0 });
    
    assert.equal(filtradas.length, 2, "Deve retornar 2 laboratórios");
  });
  
  QUnit.test("Teste 20: Filtrar salas por capacidade mínima", assert => {
    // Adicionar salas com capacidades diferentes
    adicionarSala({ bloco: "Bloco D", sala: "D401", capacidade: 15, tipo: "Sala de Aula" });
    adicionarSala({ bloco: "Bloco D", sala: "D402", capacidade: 30, tipo: "Sala de Aula" });
    adicionarSala({ bloco: "Bloco D", sala: "D403", capacidade: 50, tipo: "Auditório" });
    
    // Filtrar capacidade >= 30
    const filtradas = filtrarSalas(salasCadastradas, { bloco: "", tipo: "", capacidade: 30 });
    
    assert.equal(filtradas.length, 2, "Deve retornar 2 salas com capacidade >= 30");
  });
  
  QUnit.test("Teste 21: Filtrar agendamentos por responsável", assert => {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Adicionar agendamentos de pessoas diferentes
    adicionarAgendamento({
      bloco: "Bloco E", sala: "E501", tipo: "Laboratório",
      dataInicial: hoje, dataFinal: hoje, diaSemana: getDiaSemana(hoje),
      horaInicial: "08:00", horaFinal: "10:00",
      cpf: "111.111.111-11", nome: "Ana Costa", disciplina: "Física"
    });
    
    adicionarAgendamento({
      bloco: "Bloco E", sala: "E502", tipo: "Sala de Aula",
      dataInicial: hoje, dataFinal: hoje, diaSemana: getDiaSemana(hoje),
      horaInicial: "14:00", horaFinal: "16:00",
      cpf: "222.222.222-22", nome: "Pedro Lima", disciplina: "Química"
    });
    
    // Filtrar por responsável
    const filtrados = filtrarAgendamentos(agendamentos, { responsavel: "Ana", bloco: "", periodo: "" });
    
    assert.equal(filtrados.length, 1, "Deve retornar 1 agendamento de Ana");
  });
  
  // ========== TESTES DE DIA DA SEMANA ==========
  
  QUnit.test("Teste 22: Obter dia da semana de uma data", assert => {
    // Testar com datas conhecidas
    // 2025-11-24 nossa função retorna Segunda-feira
    const diaSemana = getDiaSemana("2025-11-24");
    
    assert.ok(diaSemana, "Deve retornar um dia da semana");
    // Verificar se retorna algum dia válido
    const diasValidos = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    assert.ok(diasValidos.includes(diaSemana), "Deve retornar um dia válido");
  });
  
  QUnit.test("Teste 23: Verificar diferentes dias da semana", assert => {
    // Domingo: 2025-11-23
    assert.equal(getDiaSemana("2025-11-23"), "Domingo", "Domingo");
    // Segunda: 2025-11-24
    assert.equal(getDiaSemana("2025-11-24"), "Segunda-feira", "Segunda-feira");
    // Terça: 2025-11-25
    assert.equal(getDiaSemana("2025-11-25"), "Terça-feira", "Terça-feira");
  });
});
