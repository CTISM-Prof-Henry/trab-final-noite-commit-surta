/*
  dom.js - Manipulação de DOM e interface
  
  Este arquivo contém funções que interagem com o DOM.
  NÃO É TESTÁVEL com ferramentas convencionais, mas está OK.
*/

// Mapa para manter as cores consistentes para cada agendamento
const coresAgendamentos = new Map();

/* ========== FUNÇÕES DE MODAL ========== */

function cadastroSalas() {
  $('#modalum').modal('show');
}

function abrirModalAgendamento() {
  $('#modalAgendamento').modal('show');
}

function consultarCadastros() {
  $('#modaltres').modal('show');
  const filtroBlocoEl = document.getElementById('filtroBloco');
  const filtroTipoEl = document.getElementById('filtroTipo');
  const filtroCapEl = document.getElementById('filtroCapacidade');
  if (filtroBlocoEl) filtroBlocoEl.addEventListener('change', atualizarListaCadastros);
  if (filtroTipoEl) filtroTipoEl.addEventListener('change', atualizarListaCadastros);
  if (filtroCapEl) filtroCapEl.addEventListener('input', atualizarListaCadastros);

  atualizarListaCadastros();
}

function consultarAgendamentos() {
  $('#modaldois').modal('show');

  document.getElementById('filtroResponsavel').addEventListener('input', atualizarCardAgendamentos);
  document.getElementById('filtroBlocoAgendamento').addEventListener('change', atualizarCardAgendamentos);
  document.getElementById('filtroPeriodoAgendamento').addEventListener('change', atualizarCardAgendamentos);

  atualizarCardAgendamentos();
}

/* ========== ATUALIZAÇÃO DE LISTAS E CARDS ========== */

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

  // Criar container para cards
  let cardsRow = modalBody.querySelector('.cards-container');
  if (!cardsRow) {
    cardsRow = document.createElement('div');
    cardsRow.className = 'row cards-container';
    modalBody.appendChild(cardsRow);
  }
  cardsRow.innerHTML = '';

  // Filtrar salas usando função da lógica
  const salasFiltradas = filtrarSalas(salasCadastradas, {
    bloco: blocoFiltro,
    tipo: tipoFiltro,
    capacidade: capacidadeFiltro
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
  
  // Criar cards para cada sala filtrada
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
          <div class="d-flex justify-content-end">
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

function filtrarCadastros() {
  atualizarListaCadastros();
}

function criarCardAgendamento(agendamento) {
  const card = document.createElement('div');
  card.className = 'col-md-6 mb-3';
  
  const dataFormatada = new Date(agendamento.dataInicial).toLocaleDateString('pt-BR');
  const dataFinalFormatada = new Date(agendamento.dataFinal).toLocaleDateString('pt-BR');
  
  const hoje = new Date();
  const dataAgendamento = new Date(agendamento.dataInicial);
  const statusClass = dataAgendamento < hoje ? 'bg-secondary' : 'bg-info';
  const statusText = dataAgendamento < hoje ? 'CONCLUÍDO' : 'AGENDADO';

  const iconeClasse = {
    'Laboratório': 'fa-desktop',
    'Auditório': 'fa-theater-masks'
  }[agendamento.tipo] || 'fa-door-closed';

  card.innerHTML = `
    <div class="card shadow-sm h-100">
      <div class="card-header ${statusClass} text-white d-flex justify-content-between align-items-center">
        <h6 class="mb-0">${agendamento.bloco} - ${agendamento.sala}</h6>
        <span class="badge badge-light">${statusText}</span>
      </div>
      <div class="card-body">
        <div class="d-flex align-items-center mb-3">
          <i class="fa ${iconeClasse}" style="font-size:2rem; color:#0d2e6d; margin-right: 15px;"></i>
          <div class="text-left">
            <h6 class="mb-0">${agendamento.tipo}</h6>
            <small class="text-muted">Responsável: ${agendamento.nome}</small>
          </div>
        </div>

        <div class="row text-left">
          <div class="col-12">
            <p class="mb-1"><i class="far fa-calendar-alt mr-2"></i>De: ${dataFormatada} até ${dataFinalFormatada}</p>
            <p class="mb-1"><i class="far fa-clock mr-2"></i>Horário: ${agendamento.horaInicial} - ${agendamento.horaFinal}</p>
            <p class="mb-1"><i class="fas fa-book mr-2"></i>Disciplina: ${agendamento.disciplina}</p>
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

  return card;
}

function atualizarCardAgendamentos() {
  const container = document.querySelector('#modaldois .cards-container');
  
  const responsavel = document.getElementById('filtroResponsavel').value;
  const bloco = document.getElementById('filtroBlocoAgendamento').value;
  const periodo = document.getElementById('filtroPeriodoAgendamento').value;

  const agendamentosFiltrados = filtrarAgendamentos(agendamentos, { responsavel, bloco, periodo });

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

  const agendamentosOrdenados = ordenarAgendamentos(agendamentosFiltrados);

  agendamentosOrdenados.forEach(agendamento => {
    container.appendChild(criarCardAgendamento(agendamento));
  });
}

/* ========== ATUALIZAÇÃO DE SELECTS ========== */

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
    const salasDoBlocoCadastradas = salasCadastradas.filter(s => s.bloco === blocoSelecionado);

    if (salasDoBlocoCadastradas.length === 0) {
      salaSelect.innerHTML = '<option disabled selected>Não há salas cadastradas neste bloco</option>';
      return;
    }

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

    salaSelect.removeEventListener('change', atualizarTipoSala);
    salaSelect.addEventListener('change', atualizarTipoSala);
  } else {
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

/* ========== TABELA SEMANAL ========== */

function atualizarTabelaSemanal() {
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const horarios = [
    '07:30', '08:20', '09:10', '10:10', '11:00', '11:50',
    '13:30', '14:20', '15:10', '16:20', '17:10', '18:00',
    '19:00', '19:50', '20:40', '21:30', '22:20', '23:00'
  ];

  coresAgendamentos.clear();

  let html = `
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
      const [horaAtual, minAtual] = horario.split(':').map(Number);
      const minutoAtual = horaAtual * 60 + minAtual;

      const agendamentosHorario = agendamentos.filter(ag => {
        const [horaInicio, minInicio] = ag.horaInicial.split(':').map(Number);
        const [horaFim, minFim] = ag.horaFinal.split(':').map(Number);
        const minutoInicio = horaInicio * 60 + minInicio;
        const minutoFim = horaFim * 60 + minFim;

        const diaAbreviado = ag.diaSemana.substring(0, 3);

        return diaAbreviado === dia &&
               minutoAtual >= minutoInicio &&
               minutoAtual < minutoFim;
      });

      if (agendamentosHorario.length > 0) {
        const ag = agendamentosHorario[0];
        
        const chaveAgendamento = `${ag.bloco}-${ag.sala}-${ag.horaInicial}-${ag.diaSemana}`;
        if (!coresAgendamentos.has(chaveAgendamento)) {
          coresAgendamentos.set(chaveAgendamento, gerarCorAleatoria());
        }
        const corAgendamento = coresAgendamentos.get(chaveAgendamento);
        
        html += `<td class="text-white small p-1" style="font-size: 0.8rem; background-color: ${corAgendamento}">
          ${ag.bloco}-${ag.sala}<br>
          <span style="font-size: 0.7rem;">${ag.disciplina || ag.nome}</span>
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

/* ========== HANDLERS DE FORMULÁRIO ========== */

function cadastrarSala(event) {
  event.preventDefault();

  const bloco = document.getElementById('bloco').value;
  const sala = document.getElementById('sala').value;
  const capacidade = parseInt(document.getElementById('capacidade').value);
  const tipo = document.getElementById('tipo').value;

  // Validar usando função da lógica
  const validacao = validarCadastroSala(bloco, sala, capacidade, tipo, salasCadastradas);
  
  if (!validacao.valido) {
    alert(validacao.erro);
    return;
  }

  // Forçar tipo se for Auditório
  const tipoFinal = bloco === 'Auditório' ? 'Auditório' : tipo;

  adicionarSala({ bloco, sala, capacidade, tipo: tipoFinal });
  salvarSalasCadastradas();

  alert('Sala cadastrada com sucesso!');
  $('#modalum').modal('hide');
  event.target.reset();
}

const realizarAgendamento = function(event) {
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
  const disciplina = document.getElementById('disciplinaAgendamento').value;
  const capacidade = parseInt(document.getElementById('capacidadeAgendamento').value) || 0;

  // Validar usando função da lógica
  const validacao = validarAgendamento(
    { bloco, sala, dataInicial, horaInicial, horaFinal, capacidade },
    agendamentos
  );

  if (!validacao.valido) {
    alert(validacao.erro);
    return;
  }

  adicionarAgendamento({
    bloco,
    sala,
    tipo,
    dataInicial,
    dataFinal,
    diaSemana: validacao.diaSemana,
    horaInicial,
    horaFinal,
    cpf,
    nome,
    disciplina
  });

  salvarAgendamentos();
  alert('Agendamento realizado com sucesso!');
  $('#modalAgendamento').modal('hide');
  atualizarTabelaSemanal();
};

function excluirSala(bloco, numeroSala) {
  removerSala(bloco, numeroSala);
  salvarSalasCadastradas();
  alert('Sala excluída com sucesso!');
  atualizarListaCadastros();
}

function excluirAgendamento(dataAgendamento, sala, horaInicial) {
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    removerAgendamento(dataAgendamento, sala, horaInicial);
    salvarAgendamentos();
    consultarAgendamentos();
    atualizarTabelaSemanal();
  }
}

/* ========== INICIALIZAÇÃO ========== */

document.addEventListener('DOMContentLoaded', function() {
  carregarSalasCadastradas();
  carregarAgendamentos();

  const formCadastro = document.querySelector('#modalum form');
  if (formCadastro) {
    formCadastro.addEventListener('submit', function(e) {
      e.preventDefault();
      cadastrarSala(e);
    });
  }

  const formAgendamento = document.querySelector('#modalAgendamento form');
  if (formAgendamento) {
    formAgendamento.addEventListener('submit', realizarAgendamento);
  }

  atualizarTabelaSemanal();

  const salaAgendamentoSelect = document.getElementById('salaAgendamento');
  if (salaAgendamentoSelect) {
    salaAgendamentoSelect.addEventListener('change', atualizarTipoSala);
  }
});
