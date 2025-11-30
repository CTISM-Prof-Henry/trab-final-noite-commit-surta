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
// Configuração dos testes focados em datas e horários (10 testes)
QUnit.module("Testes - Datas e Horários", hooks => {
  hooks.beforeEach(() => {
    // Simular localStorage e limpar arrays
    global.localStorage = localStorageMock;
    localStorage.clear();
    salasCadastradas.length = 0;
    agendamentos.length = 0;
  });

  // 1 - não aceitar agendamento para hoje
  QUnit.test("Não aceitar agendamento para hoje", assert => {
    const hoje = new Date().toISOString().split('T')[0];
    const dados = { bloco: 'Bloco A', sala: 'A101', dataInicial: hoje, horaInicial: '08:00', horaFinal: '10:00', capacidade: 30 };
    const resultado = validarAgendamento(dados, agendamentos);
    assert.notOk(resultado.valido, 'Agendamento para hoje não deve ser aceito');
  });

  // 2 - não aceitar data passada
  QUnit.test("Não aceitar data passada", assert => {
    const ontem = new Date(); ontem.setDate(ontem.getDate() - 1);
    const dataOntem = ontem.toISOString().split('T')[0];
    const dados = { bloco: 'Bloco A', sala: 'A101', dataInicial: dataOntem, horaInicial: '08:00', horaFinal: '10:00', capacidade: 30 };
    const resultado = validarAgendamento(dados, agendamentos);
    assert.notOk(resultado.valido, 'Data passada não deve ser aceita');
  });

  // 3 - não aceitar sábado (usar helper para próximo sábado)
  QUnit.test("Não aceitar sábado", assert => {
    const sabado = getProximaData(6);
    const dados = { bloco: 'Bloco A', sala: 'A101', dataInicial: sabado, horaInicial: '08:00', horaFinal: '10:00', capacidade: 30 };
    const resultado = validarAgendamento(dados, agendamentos);
    assert.notOk(resultado.valido, 'Sábado não deve ser aceito');
  });

  // 4 - não aceitar domingo
  QUnit.test("Não aceitar domingo", assert => {
    const domingo = getProximaData(0);
    const dados = { bloco: 'Bloco A', sala: 'A101', dataInicial: domingo, horaInicial: '08:00', horaFinal: '10:00', capacidade: 30 };
    const resultado = validarAgendamento(dados, agendamentos);
    assert.notOk(resultado.valido, 'Domingo não deve ser aceito');
  });

  // 5 - horário final não pode ser antes do inicial
  QUnit.test('Horário final > inicial', assert => {
    const dataFutura = '2025-12-01';
    const dados = { bloco: 'Bloco A', sala: 'A101', dataInicial: dataFutura, horaInicial: '10:00', horaFinal: '08:00', capacidade: 30 };
    const resultado = validarAgendamento(dados, agendamentos);
    assert.notOk(resultado.valido, 'Horário final antes do inicial não é permitido');
  });

  // 6 - verificar período manhã
  QUnit.test('Periodo manhã', assert => {
    assert.ok(verificarPeriodo('08:00','manha'));
    assert.ok(verificarPeriodo('11:50','manha'));
  });

  // 7 - verificar período tarde
  QUnit.test('Periodo tarde', assert => {
    assert.ok(verificarPeriodo('13:30','tarde'));
    assert.ok(verificarPeriodo('17:00','tarde'));
  });

  // 8 - verificar período noite
  QUnit.test('Periodo noite', assert => {
    assert.ok(verificarPeriodo('19:00','noite'));
    assert.ok(verificarPeriodo('22:00','noite'));
  });

  // 9 - obter dia da semana (validação básica)
  QUnit.test('Obter dia da semana', assert => {
    const dia = getDiaSemana('2025-11-24');
    const validos = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    assert.ok(validos.includes(dia));
  });

  // 10 - verificar dias específicos
  QUnit.test('Dias específicos', assert => {
    assert.equal(getDiaSemana('2025-11-23'),'Domingo');
    assert.equal(getDiaSemana('2025-11-24'),'Segunda-feira');
    assert.equal(getDiaSemana('2025-11-25'),'Terça-feira');
  });

});
