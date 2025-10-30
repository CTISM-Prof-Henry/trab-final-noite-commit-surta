
// Abrir modais
function cadastroSalas() {
  $('#modalum').modal('show');
}

function realizarAgendamento() {
  $('#modalAgendamento').modal('show');
}

function consultarAgendamentos() {
  $('#modaldois').modal('show');
}

function consultarCadastros() {
  $('#modaltres').modal('show');
  // Adicionar event listeners para os filtros do modal de cadastros
  const filtroBlocoEl = document.getElementById('filtroBloco');
  const filtroTipoEl = document.getElementById('filtroTipo');
  const filtroCapEl = document.getElementById('filtroCapacidade');
  if (filtroBlocoEl) filtroBlocoEl.addEventListener('change', atualizarListaCadastros);
  if (filtroTipoEl) filtroTipoEl.addEventListener('change', atualizarListaCadastros);
  if (filtroCapEl) filtroCapEl.addEventListener('input', atualizarListaCadastros);

  atualizarListaCadastros();
}

function atualizarListaCadastros() {
  const modalBody = document.querySelector('#modaltres .modal-body');
  const filtrosDiv = modalBody.querySelector('.form-row');

  const blocoFiltro = document.getElementById('filtroBloco').value;
  const tipoFiltro = document.getElementById('filtroTipo').value;
  const capacidadeFiltro = parseInt(document.getElementById('filtroCapacidade').value) || 0;

  // Remover conteúdo anterior (exceto filtros)
  Array.from(modalBody.children).forEach(child => {
    if (child !== filtrosDiv) child.remove();
  });

  // Criar container para cards (mesma estrutura do modal de agendamentos)
  let cardsRow = modalBody.querySelector('.cards-container');
  if (!cardsRow) {
    cardsRow = document.createElement('div');
    cardsRow.className = 'row cards-container';
    modalBody.appendChild(cardsRow);
  }
  cardsRow.innerHTML = '';

  // Filtrar salas cadastradas
  const salasFiltradas = salasCadastradas.filter(sala => {
    const matchBloco = !blocoFiltro || sala.bloco === blocoFiltro;
    const matchTipo = !tipoFiltro || sala.tipo === tipoFiltro;
    const matchCapacidade = sala.capacidade >= capacidadeFiltro;
    return matchBloco && matchTipo && matchCapacidade;
  });

  if (salasFiltradas.length === 0) {
    cardsRow.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          <i class="fas fa-info-circle mr-2"></i>
          ${salasCadastradas.length === 0 ? 'Nenhuma sala cadastrada ainda.' : 'Nenhuma sala corresponde aos filtros selecionados.'}
        </div>
      </div>`;
    return;
  }

  // Criar cartões com mesma estética dos agendamentos
  salasFiltradas.forEach(sala => {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-3';
    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${sala.bloco} - ${sala.sala}</h6>
          <span class="badge badge-light">${sala.tipo}</span>
        </div>
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <i class="fa ${sala.tipo === 'Laboratório' ? 'fa-desktop' : sala.tipo === 'Auditório' ? 'fa-theater-masks' : 'fa-door-closed'}" style="font-size:2rem; color:#0d2e6d; margin-right: 15px;"></i>
            <div class="text-left">
              <h6 class="mb-0">${sala.tipo}</h6>
              <small class="text-muted">Responsável: ${sala.nome || '—'}</small>
            </div>
          </div>
          <div class="row text-left">
            <div class="col-12">
              <p class="mb-1"><i class="fas fa-users mr-2"></i>Capacidade: ${sala.capacidade} pessoas</p>
              <p class="mb-0"><i class="far fa-calendar-alt mr-2"></i>Cadastrada em ${sala.dataCadastro}</p>
            </div>
          </div>
        </div>
        <div class="card-footer bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">CPF: ${sala.cpf || '—'}</small>
            <button class="btn btn-outline-danger btn-sm" onclick="excluirSala('${sala.bloco}', '${sala.sala}')">
              <i class="fas fa-trash-alt mr-1"></i>Excluir
            </button>
          </div>
        </div>
      </div>
    `;
    cardsRow.appendChild(col);
  });
}

// Função para filtrar cadastros (chamada quando os filtros são alterados)
function filtrarCadastros() {
  atualizarListaCadastros();
}

// Lista de todas as salas possíveis por bloco
const salasPorBloco = {
  "Bloco A": ["A1", "A2", "A3"],
  "Bloco B": ["B101", "B201", "B301"],
  "Bloco C": ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"],
  "Bloco D": ["D1", "D2", "D3", "D4"],
  "Bloco E": ["E101", "E102", "E103"],
  "Bloco F": ["F101", "F102", "F201", "F202", "F203"],
  "Bloco G": ["G1", "G2", "G3"],
  "Auditório": ["Auditório Principal"]
};

// Arrays para armazenar as salas e agendamentos
let salasCadastradas = [];
let agendamentos = [];

// Função para carregar dados do localStorage
function carregarSalasCadastradas() {
  const salasJSON = localStorage.getItem('salasCadastradas');
  if (salasJSON) {
    salasCadastradas = JSON.parse(salasJSON);
  }
}

// Função para salvar salas no localStorage
function salvarSalasCadastradas() {
  localStorage.setItem('salasCadastradas', JSON.stringify(salasCadastradas));
}

// Função para carregar agendamentos do localStorage
function carregarAgendamentos() {
  const agendamentosJSON = localStorage.getItem('agendamentos');
  if (agendamentosJSON) {
    agendamentos = JSON.parse(agendamentosJSON);
  }
}

// Função para salvar agendamentos no localStorage
function salvarAgendamentos() {
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

// Carregar dados ao iniciar a página
carregarSalasCadastradas();
carregarAgendamentos();

// Função para excluir uma sala
function excluirSala(bloco, numeroSala) {
  salasCadastradas = salasCadastradas.filter(s => !(s.bloco === bloco && s.sala === numeroSala));
  salvarSalasCadastradas();
  alert('Sala excluída com sucesso!');
}

// Função para cadastrar uma nova sala
function cadastrarSala(event) {
  event.preventDefault();
  
  const bloco = document.getElementById('bloco').value;
  const sala = document.getElementById('sala').value;
  const capacidade = parseInt(document.getElementById('capacidade').value);
  const tipo = document.getElementById('tipo').value;
  const cpf = document.getElementById('cpfResponsavel').value;
  const nome = document.getElementById('nomeResponsavel').value;

  // Verifica se a sala já está cadastrada
  const salaCadastrada = salasCadastradas.find(s => s.bloco === bloco && s.sala === sala);
  if (salaCadastrada) {
    alert('Esta sala já está cadastrada!');
    return;
  }

  // Validações específicas para auditório
  if (bloco === 'Auditório') {
    if (capacidade > 100) {
      alert('A capacidade máxima do auditório é 100 pessoas.');
      return;
    }
    if (tipo !== 'Auditório') {
      document.getElementById('tipo').value = 'Auditório';
    }
  }

  // Adiciona a sala ao array de salas cadastradas
  salasCadastradas.push({
    bloco,
    sala,
    capacidade,
    tipo: bloco === 'Auditório' ? 'Auditório' : tipo,
    cpf,
    nome,
    dataCadastro: new Date().toLocaleDateString()
  });

  // Salva no localStorage
  salvarSalasCadastradas();

  alert('Sala cadastrada com sucesso!');
  $('#modalum').modal('hide');
  
  // Limpa o formulário
  event.target.reset();
}

// Função para atualizar o tipo da sala quando selecionada
function atualizarTipoSala(event) {
  const salaSelect = event.target;
  const blocoSelect = document.getElementById('blocoAgendamento');
  const tipoSelect = document.getElementById('tipoAgendamento');
  
  const salaSelecionada = salasCadastradas.find(
    s => s.bloco === blocoSelect.value && s.sala === salaSelect.value
  );
  
  if (salaSelecionada) {
    tipoSelect.value = salaSelecionada.tipo;
  }
}

function atualizarSalas(formulario = '') {
  let blocoSelect, salaSelect, tipoSelect;
  
  if (formulario === 'Agendamento') {
    blocoSelect = document.getElementById('blocoAgendamento');
    salaSelect = document.getElementById('salaAgendamento');
    tipoSelect = document.getElementById('tipoAgendamento');
  } else {
    blocoSelect = document.getElementById('bloco');
    salaSelect = document.getElementById('sala');
    tipoSelect = document.getElementById('tipo');
  }

  // Se for Auditório, força o tipo para Auditório
  if (blocoSelect.value === 'Auditório') {
    tipoSelect.value = 'Auditório';
    tipoSelect.disabled = true;
  } else {
    tipoSelect.disabled = false;
  }

  const blocoSelecionado = blocoSelect.value;
  salaSelect.innerHTML = '';

  if (!blocoSelecionado) {
    salaSelect.innerHTML = '<option disabled selected>Selecione o bloco primeiro</option>';
    return;
  }

  if (formulario === 'Agendamento') {
    // Para agendamento, mostrar apenas salas cadastradas do bloco selecionado
    const salasDoBlocoCadastradas = salasCadastradas.filter(s => s.bloco === blocoSelecionado);
    
    if (salasDoBlocoCadastradas.length === 0) {
      salaSelect.innerHTML = '<option disabled selected>Não há salas cadastradas neste bloco</option>';
      return;
    }

    // Adiciona opção default
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione uma sala';
    defaultOption.selected = true;
    defaultOption.disabled = true;
    salaSelect.appendChild(defaultOption);

    salasDoBlocoCadastradas.forEach(sala => {
      const option = document.createElement('option');
      option.value = sala.sala;
      option.textContent = sala.sala;
      salaSelect.appendChild(option);
    });

    // Remove evento anterior para evitar duplicação
    salaSelect.removeEventListener('change', atualizarTipoSala);
    // Adiciona o evento de change
    salaSelect.addEventListener('change', atualizarTipoSala);
  } else {
    // Para cadastro, mostrar todas as salas possíveis do bloco
    if (!salasPorBloco[blocoSelecionado]) {
      salaSelect.innerHTML = '<option disabled selected>Bloco não encontrado</option>';
      return;
    }

    salasPorBloco[blocoSelecionado].forEach(sala => {
      const option = document.createElement('option');
      option.value = sala;
      option.textContent = sala;
      salaSelect.appendChild(option);
    });
  }
}
// Exportar para teste

// Adiciona o event listener quando o documento estiver pronto
// Função para realizar agendamento
function getDiaSemana(data) {
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const date = new Date(data);
  return dias[date.getDay()];
}

function realizarAgendamento(event) {
  event.preventDefault();
  
  const bloco = document.getElementById('blocoAgendamento').value;
  const sala = document.getElementById('salaAgendamento').value;
  const tipo = document.getElementById('tipoAgendamento').value;
  const dataInicial = document.getElementById('dataInicialAgendamento').value;
  const dataFinal = document.getElementById('dataFinalAgendamento').value;
  const horaInicial = document.getElementById('horaInicialAgendamento').value;
  const horaFinal = document.getElementById('horaFinalAgendamento').value;
  const cpf = document.getElementById('cpfAgendamento').value;
  const nome = document.getElementById('nomeAgendamento').value;
  const capacidade = parseInt(document.getElementById('capacidadeAgendamento').value) || 0;

  // Validação da data
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataInicialObj = new Date(dataInicial);
  dataInicialObj.setHours(0, 0, 0, 0);

  if (dataInicialObj.getTime() === hoje.getTime()) {
    alert('Não é permitido fazer agendamentos para o dia atual. Por favor, selecione uma data futura.');
    return;
  }

  if (dataInicialObj < hoje) {
    alert('Não é possível fazer agendamentos para datas passadas.');
    return;
  }

  // Determina o dia da semana baseado na data inicial
  const diaSemana = getDiaSemana(dataInicial);

  // Validação de domingo
  if (diaSemana === 'Domingo') {
    alert('Não é permitido fazer agendamentos aos domingos.');
    return;
  }
  
  // Validação da capacidade do auditório
  if (bloco === 'Auditório' && capacidade > 100) {
    alert('A capacidade máxima do auditório é de 100 pessoas.');
    return;
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
    alert('Já existe um agendamento para esta sala neste horário!');
    return;
  }

  // Adicionar novo agendamento
  agendamentos.push({
    bloco,
    sala,
    tipo,
    dataInicial,
    dataFinal,
    diaSemana,
    horaInicial,
    horaFinal,
    cpf,
    nome,
    dataAgendamento: new Date().toLocaleDateString()
  });

  salvarAgendamentos();
  alert('Agendamento realizado com sucesso!');
  $('#modalAgendamento').modal('hide');
  atualizarTabelaSemanal();
}

function atualizarTabelaSemanal() {
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const horarios = [
    '07:30', '08:20', '09:10', '10:10', '11:00', '11:50',  // Manhã
    '13:30', '14:20', '15:10', '16:20', '17:10', '18:00',  // Tarde
    '19:00', '19:50', '20:40', '21:30', '22:20', '23:00'   // Noite
  ];
  
  let html = `
    <h4 class="text-left mb-3">Horários da Semana</h4>
    <div class="table-responsive">
      <table class="table table-sm table-bordered text-center tabela-custom">
        <thead>
          <tr class="bg-light">
            <th style="width: 80px;">Horário</th>
            ${diasSemana.map(dia => `<th style="width: 16.66%">${dia}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  horarios.forEach(horario => {
    html += `<tr><td>${horario}</td>`;
    diasSemana.forEach(dia => {
      // Converter horário atual para minutos para comparação
      const [horaAtual, minAtual] = horario.split(':').map(Number);
      const minutoAtual = horaAtual * 60 + minAtual;

      const agendamentosHorario = agendamentos.filter(ag => {
        // Converter horários do agendamento para minutos
        const [horaInicio, minInicio] = ag.horaInicial.split(':').map(Number);
        const [horaFim, minFim] = ag.horaFinal.split(':').map(Number);
        const minutoInicio = horaInicio * 60 + minInicio;
        const minutoFim = horaFim * 60 + minFim;

        // Dia da semana abreviado para comparação
        const diaAbreviado = ag.diaSemana.substring(0, 3);
        
        return diaAbreviado === dia && 
               minutoAtual >= minutoInicio && 
               minutoAtual < minutoFim;
      });

      if (agendamentosHorario.length > 0) {
        const ag = agendamentosHorario[0];
        html += `<td class="bg-info text-white small p-1" style="font-size: 0.8rem;">
          ${ag.bloco}-${ag.sala}<br>
          <span style="font-size: 0.7rem;">${ag.nome}</span>
        </td>`;
      } else {
        html += '<td class="p-1"></td>';
      }
    });
    html += '</tr>';
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  const container = document.querySelector('.table-responsive');
  container.innerHTML = html;
}

function filtrarAgendamentos() {
  const responsavel = document.getElementById('filtroResponsavel').value.toLowerCase();
  const bloco = document.getElementById('filtroBlocoAgendamento').value;
  const periodo = document.getElementById('filtroPeriodoAgendamento').value;

  return agendamentos.filter(ag => {
    const matchResponsavel = ag.nome.toLowerCase().includes(responsavel);
    const matchBloco = !bloco || ag.bloco === bloco;
    
    let matchPeriodo = true;
    if (periodo) {
      const hora = parseInt(ag.horaInicial.split(':')[0]);
      if (periodo === 'manha' && (hora < 7 || hora > 11)) matchPeriodo = false;
      if (periodo === 'tarde' && (hora < 13 || hora > 17)) matchPeriodo = false;
      if (periodo === 'noite' && (hora < 19 || hora > 22)) matchPeriodo = false;
    }

    return matchResponsavel && matchBloco && matchPeriodo;
  });
}

function atualizarCardAgendamentos() {
  const container = document.querySelector('#modaldois .cards-container');
  const agendamentosFiltrados = filtrarAgendamentos();
  
  container.innerHTML = '';

  if (agendamentosFiltrados.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          <i class="fas fa-info-circle mr-2"></i>
          Nenhum agendamento encontrado com os filtros selecionados.
        </div>
      </div>`;
    return;
  }

  // Ordenar agendamentos por data e hora
  const agendamentosOrdenados = [...agendamentosFiltrados].sort((a, b) => {
    const dataA = new Date(a.dataInicial + 'T' + a.horaInicial);
    const dataB = new Date(b.dataInicial + 'T' + b.horaInicial);
    return dataA - dataB;
  });

  agendamentosOrdenados.forEach(agendamento => {
    const card = document.createElement('div');
    card.className = 'col-md-6 mb-3';
    const dataFormatada = new Date(agendamento.dataInicial).toLocaleDateString('pt-BR');
    const dataFinalFormatada = new Date(agendamento.dataFinal).toLocaleDateString('pt-BR');
    
    let statusClass = 'bg-info';
    let statusText = 'AGENDADO';
    const hoje = new Date();
    const dataAgendamento = new Date(agendamento.dataInicial);
    if (dataAgendamento < hoje) {
      statusClass = 'bg-secondary';
      statusText = 'CONCLUÍDO';
    }

    card.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-header ${statusClass} text-white d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${agendamento.bloco} - ${agendamento.sala}</h6>
          <span class="badge badge-light">${statusText}</span>
        </div>
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <i class="fa ${
              agendamento.tipo === 'Laboratório' ? 'fa-desktop' : 
              agendamento.tipo === 'Auditório' ? 'fa-theater-masks' : 
              'fa-door-closed'
            }" style="font-size:2rem; color:#0d2e6d; margin-right: 15px;"></i>
            <div class="text-left">
              <h6 class="mb-0">${agendamento.tipo}</h6>
              <small class="text-muted">Responsável: ${agendamento.nome}</small>
            </div>
          </div>
          
          <div class="row text-left">
            <div class="col-12">
              <p class="mb-1"><i class="far fa-calendar-alt mr-2"></i>De: ${dataFormatada} até ${dataFinalFormatada}</p>
              <p class="mb-1"><i class="far fa-clock mr-2"></i>Horário: ${agendamento.horaInicial} - ${agendamento.horaFinal}</p>
              <p class="mb-0"><i class="far fa-id-card mr-2"></i>CPF: ${agendamento.cpf}</p>
            </div>
          </div>
        </div>
        <div class="card-footer bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">Agendado em ${agendamento.dataAgendamento}</small>
            <button class="btn btn-outline-danger btn-sm" onclick="excluirAgendamento('${agendamento.dataAgendamento}', '${agendamento.sala}', '${agendamento.horaInicial}')">
              <i class="fas fa-trash-alt mr-1"></i>Excluir
            </button>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function consultarAgendamentos() {
  $('#modaldois').modal('show');
  
  // Adicionar event listeners para os filtros
  document.getElementById('filtroResponsavel').addEventListener('input', atualizarCardAgendamentos);
  document.getElementById('filtroBlocoAgendamento').addEventListener('change', atualizarCardAgendamentos);
  document.getElementById('filtroPeriodoAgendamento').addEventListener('change', atualizarCardAgendamentos);

  // Mostrar agendamentos iniciais
  atualizarCardAgendamentos();

  agendamentosOrdenados.forEach(agendamento => {
    const card = document.createElement('div');
    card.className = 'col-md-6 mb-3';
    const dataFormatada = new Date(agendamento.dataInicial).toLocaleDateString('pt-BR');
    const dataFinalFormatada = new Date(agendamento.dataFinal).toLocaleDateString('pt-BR');
    
    let statusClass = 'bg-info';
    let statusText = 'AGENDADO';
    const hoje = new Date();
    const dataAgendamento = new Date(agendamento.dataInicial);
    if (dataAgendamento < hoje) {
      statusClass = 'bg-secondary';
      statusText = 'CONCLUÍDO';
    }

    card.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-header ${statusClass} text-white d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${agendamento.bloco} - ${agendamento.sala}</h6>
          <span class="badge badge-light">${statusText}</span>
        </div>
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <i class="fa ${
              agendamento.tipo === 'Laboratório' ? 'fa-desktop' : 
              agendamento.tipo === 'Auditório' ? 'fa-theater-masks' : 
              'fa-door-closed'
            }" style="font-size:2rem; color:#0d2e6d; margin-right: 15px;"></i>
            <div class="text-left">
              <h6 class="mb-0">${agendamento.tipo}</h6>
              <small class="text-muted">Responsável: ${agendamento.nome}</small>
            </div>
          </div>
          
          <div class="row text-left">
            <div class="col-12">
              <p class="mb-1"><i class="far fa-calendar-alt mr-2"></i>De: ${dataFormatada} até ${dataFinalFormatada}</p>
              <p class="mb-1"><i class="far fa-clock mr-2"></i>Horário: ${agendamento.horaInicial} - ${agendamento.horaFinal}</p>
              <p class="mb-0"><i class="far fa-id-card mr-2"></i>CPF: ${agendamento.cpf}</p>
            </div>
          </div>
        </div>
        <div class="card-footer bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">Agendado em ${agendamento.dataAgendamento}</small>
            <button class="btn btn-outline-danger btn-sm" onclick="excluirAgendamento('${agendamento.dataAgendamento}', '${agendamento.sala}', '${agendamento.horaInicial}')">
              <i class="fas fa-trash-alt mr-1"></i>Excluir
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function excluirAgendamento(dataAgendamento, sala, horaInicial) {
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    agendamentos = agendamentos.filter(ag => 
      !(ag.dataAgendamento === dataAgendamento && 
        ag.sala === sala && 
        ag.horaInicial === horaInicial)
    );
    salvarAgendamentos();
    consultarAgendamentos();
    atualizarTabelaSemanal();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Formulário de cadastro de salas
  const formCadastro = document.querySelector('#modalum form');
  if (formCadastro) {
    formCadastro.addEventListener('submit', cadastrarSala);
  }

  // Formulário de agendamento
  const formAgendamento = document.querySelector('#modalAgendamento form');
  if (formAgendamento) {
    formAgendamento.addEventListener('submit', realizarAgendamento);
  }

  // Inicializar a tabela semanal
  atualizarTabelaSemanal();
});

if (typeof module !== "undefined") {
  module.exports = { atualizarSalas, salasPorBloco, salasCadastradas };
}

