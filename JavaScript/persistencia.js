
/*
  carregarSalasCadastradas()
  Carrega salas do localStorage (fallback quando IndexedDB não está pronto)
*/
function carregarSalasCadastradas() {
  const salasJSON = localStorage.getItem('salasCadastradas');
  if (salasJSON) {
    const salas = JSON.parse(salasJSON);
    salasCadastradas.length = 0;
    salasCadastradas.push(...salas);
  }
}

/*
  salvarSalasCadastradas()
  Salva o array de salas no localStorage e IndexedDB
*/
function salvarSalasCadastradas() {
  // Sempre salvar no localStorage como backup
  localStorage.setItem('salasCadastradas', JSON.stringify(salasCadastradas));
  
  // Se IndexedDB estiver disponível, salvar lá também
  if (typeof dataHandler !== 'undefined' && dataHandler && dataHandler.isReady()) {
    // Limpar e re-salvar todas as salas
    dataHandler.clearAll(() => {
      salasCadastradas.forEach(sala => {
        dataHandler.saveSala(sala);
      });
      agendamentos.forEach(ag => {
        dataHandler.saveAgendamento(ag);
      });
    });
  }
}

/*
  carregarAgendamentos()
  Carrega agendamentos do localStorage (fallback quando IndexedDB não está pronto)
*/
function carregarAgendamentos() {
  const agendamentosJSON = localStorage.getItem('agendamentos');
  if (agendamentosJSON) {
    const agends = JSON.parse(agendamentosJSON);
    agendamentos.length = 0;
    agendamentos.push(...agends);
  }
}

/*
  salvarAgendamentos()
  Salva o array de agendamentos no localStorage e IndexedDB
*/
function salvarAgendamentos() {
  // Sempre salvar no localStorage como backup
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
  
  // Se IndexedDB estiver disponível, salvar lá também
  if (typeof dataHandler !== 'undefined' && dataHandler && dataHandler.isReady()) {
    // Limpar e re-salvar todos os agendamentos
    dataHandler.clearAll(() => {
      salasCadastradas.forEach(sala => {
        dataHandler.saveSala(sala);
      });
      agendamentos.forEach(ag => {
        dataHandler.saveAgendamento(ag);
      });
    });
  }
}

// Carregar dados ao iniciar a página (fallback)
// IndexedDB carregará automaticamente se estiver disponível
carregarSalasCadastradas();
carregarAgendamentos();
