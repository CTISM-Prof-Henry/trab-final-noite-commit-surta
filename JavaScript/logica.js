

// Lista de todas as salas possíveis por bloco
const salasPorBloco = {
  "Bloco A": ["A1", "A2", "A3"],
  "Bloco B": ["B101", "B201", "B301"],
  "Bloco C": ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"],
  "Bloco D": ["D1", "D2", "D3", "D4"],
  "Bloco E": ["E101", "E102", "E103"],
  "Bloco F": ["F101", "F102", "F201", "F202", "F203"],
  "Bloco G": ["G1", "G2", "G3"],
  "Auditorio": ["Auditório Principal"]
};

// Arrays para armazenar as salas e agendamentos
let salasCadastradas = [];
let agendamentos = [];

/*
  getDiaSemana(data)
  Entrada: string ou Date aceitável pelo construtor Date (ex: '2025-11-04')
  Saída: string com o nome do dia da semana em português
*/
function getDiaSemana(dataStr) {
  // Criar data sem problemas de timezone
  const partes = dataStr.split('-');
  const data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
  
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return dias[data.getDay()];
}

/*
  verificarPeriodo(horaInicial, periodo)
  Verifica se um horário está dentro do período especificado
  Entrada: horaInicial (string 'HH:MM'), periodo ('manha'|'tarde'|'noite')
  Saída: boolean
*/
function verificarPeriodo(horaInicial, periodo) {
  if (!periodo) return true;
  
  const hora = parseInt(horaInicial.split(':')[0]);
  switch(periodo) {
    case 'manha': return hora >= 7 && hora <= 11;
    case 'tarde': return hora >= 13 && hora <= 17;
    case 'noite': return hora >= 19 && hora <= 22;
    default: return true;
  }
}

/*
  validarCadastroSala(bloco, sala, capacidade, tipo, salasCadastradas)
  Valida os dados de cadastro de uma sala
  Retorna: { valido: boolean, erro: string }
*/
function validarCadastroSala(bloco, sala, capacidade, tipo, salasCadastradas) {
  // Validar campos obrigatórios
  if (!bloco || bloco === '') {
    return { valido: false, erro: 'Por favor, selecione um bloco.' };
  }
  
  if (!sala || sala === '') {
    return { valido: false, erro: 'Por favor, selecione uma sala.' };
  }
  
  if (!capacidade || capacidade < 1) {
    return { valido: false, erro: 'A capacidade deve ser no mínimo 1 pessoa.' };
  }
  
  if (!tipo || tipo === '') {
    return { valido: false, erro: 'Por favor, selecione o tipo da sala.' };
  }
  
  // Verifica se a sala já está cadastrada
  const salaCadastrada = salasCadastradas.find(s => s.bloco === bloco && s.sala === sala);
  if (salaCadastrada) {
    return { valido: false, erro: 'Esta sala já está cadastrada!' };
  }

  // Validações específicas para auditório
  if (bloco === 'Auditório') {
    if (capacidade > 100) {
      return { valido: false, erro: 'A capacidade máxima do auditório é 100 pessoas.' };
    }
  }

  return { valido: true, erro: null };
}

/*
  validarAgendamento(dadosAgendamento, agendamentos)
  Valida os dados de um agendamento
  Entrada: objeto com { bloco, sala, dataInicial, horaInicial, horaFinal, capacidade }
  Retorna: { valido: boolean, erro: string }
*/
function validarAgendamento(dadosAgendamento, agendamentos) {
  const { bloco, sala, dataInicial, horaInicial, horaFinal, capacidade } = dadosAgendamento;

  // Validar campos básicos
  if (!bloco || !sala) {
    return { valido: false, erro: 'Bloco e sala são obrigatórios.' };
  }
  
  // Validação da data
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataInicialObj = new Date(dataInicial);
  dataInicialObj.setHours(0, 0, 0, 0);

  // Não permite agendamentos para hoje ou datas passadas (apenas amanhã em diante)
  if (dataInicialObj <= hoje) {
    return { valido: false, erro: 'Não é permitido fazer agendamentos para hoje. Por favor, selecione uma data futura a partir de amanhã.' };
  }
  
  // Validação de horários
  const [horaIni, minIni] = horaInicial.split(':').map(Number);
  const [horaFim, minFim] = horaFinal.split(':').map(Number);
  const minutoInicial = horaIni * 60 + minIni;
  const minutoFinal = horaFim * 60 + minFim;

  if (minutoFinal <= minutoInicial) {
    return { valido: false, erro: 'O horário final deve ser posterior ao horário inicial.' };
  }

  // Determina o dia da semana baseado na data inicial
  const diaSemana = getDiaSemana(dataInicial);

  // Validação de final de semana (sábado e domingo)
  if (diaSemana === 'Domingo') {
    return { valido: false, erro: 'Não é permitido fazer agendamentos aos domingos.' };
  }
  
  if (diaSemana === 'Sábado') {
    return { valido: false, erro: 'Não é permitido fazer agendamentos aos sábados.' };
  }

  // Validação da capacidade do auditório
  if (bloco === 'Auditório' && capacidade > 100) {
    return { valido: false, erro: 'A capacidade máxima do auditório é de 100 pessoas.' };
  }

  // Verificar se há conflito de horário
  const conflito = agendamentos.some(ag =>
    ag.bloco === bloco &&
    ag.sala === sala &&
    ag.diaSemana === diaSemana &&
    ((horaInicial >= ag.horaInicial && horaInicial < ag.horaFinal) ||
     (horaFinal > ag.horaInicial && horaFinal <= ag.horaFinal))
  );

  if (conflito) {
    return { valido: false, erro: 'Já existe um agendamento para esta sala neste horário!' };
  }

  return { valido: true, erro: null, diaSemana };
}

/*
  filtrarSalas(salasCadastradas, filtros)
  Filtra salas com base nos critérios fornecidos
  Entrada: array de salas, objeto { bloco, tipo, capacidade }
  Saída: array filtrado de salas
*/
function filtrarSalas(salasCadastradas, filtros) {
  const { bloco, tipo, capacidade } = filtros;
  
  return salasCadastradas.filter(sala => {
    const matchBloco = !bloco || bloco === '' || sala.bloco === bloco;
    const matchTipo = !tipo || tipo === '' || sala.tipo === tipo;
    const matchCapacidade = !capacidade || capacidade === 0 || sala.capacidade >= capacidade;
    return matchBloco && matchTipo && matchCapacidade;
  });
}

/*
  filtrarAgendamentos(agendamentos, filtros)
  Filtra agendamentos com base nos critérios fornecidos
  Entrada: array de agendamentos, objeto { responsavel, bloco, periodo }
  Saída: array filtrado de agendamentos
*/
function filtrarAgendamentos(agendamentos, filtros) {
  const { responsavel, bloco, periodo } = filtros;

  return agendamentos.filter(ag => {
    const matchResponsavel = !responsavel || responsavel === '' || ag.nome.toLowerCase().includes(responsavel.toLowerCase());
    const matchBloco = !bloco || bloco === '' || ag.bloco === bloco;
    const matchPeriodo = !periodo || periodo === '' || verificarPeriodo(ag.horaInicial, periodo);

    return matchResponsavel && matchBloco && matchPeriodo;
  });
}

/*
  ordenarAgendamentos(agendamentos)
  Ordena agendamentos por data e hora
  Entrada: array de agendamentos
  Saída: array ordenado
*/
function ordenarAgendamentos(agendamentos) {
  return [...agendamentos].sort((a, b) => {
    const dataA = new Date(a.dataInicial + 'T' + a.horaInicial);
    const dataB = new Date(b.dataInicial + 'T' + b.horaInicial);
    return dataA - dataB;
  });
}

/*
  adicionarSala(sala)
  Adiciona uma sala ao array de salas cadastradas
*/
function adicionarSala(sala) {
  salasCadastradas.push({
    ...sala,
    dataCadastro: new Date().toLocaleDateString()
  });
}

/*
  removerSala(bloco, numeroSala)
  Remove uma sala do array
*/
function removerSala(bloco, numeroSala) {
  const indice = salasCadastradas.findIndex(s => s.bloco === bloco && s.sala === numeroSala);
  if (indice !== -1) {
    salasCadastradas.splice(indice, 1);
  }
}

/*
  adicionarAgendamento(agendamento)
  Adiciona um agendamento ao array
*/
function adicionarAgendamento(agendamento) {
  agendamentos.push({
    ...agendamento,
    dataAgendamento: new Date().toLocaleDateString()
  });
}

/*
  removerAgendamento(dataAgendamento, sala, horaInicial)
  Remove um agendamento do array
*/
function removerAgendamento(dataAgendamento, sala, horaInicial) {
  const indice = agendamentos.findIndex(ag =>
    ag.dataAgendamento === dataAgendamento &&
    ag.sala === sala &&
    ag.horaInicial === horaInicial
  );
  if (indice !== -1) {
    agendamentos.splice(indice, 1);
  }
}

/*
  gerarCorAleatoria()
  Gera uma cor aleatória suave em formato HSL
  Saída: string 'hsl(h, s%, l%)'
*/
function gerarCorAleatoria() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 20);
  const lightness = 45 + Math.floor(Math.random() * 10);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Exportação para testes
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    salasPorBloco,
    salasCadastradas,
    agendamentos,
    getDiaSemana,
    verificarPeriodo,
    validarCadastroSala,
    validarAgendamento,
    filtrarSalas,
    filtrarAgendamentos,
    ordenarAgendamentos,
    adicionarSala,
    removerSala,
    adicionarAgendamento,
    removerAgendamento,
    gerarCorAleatoria
  };
}
