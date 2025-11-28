/*
  dom.js - Manipulação de DOM e interface
  
  Este arquivo contém todas as funções que interagem diretamente com o DOM (Document Object Model).
  Inclui: abertura de modais, atualização de tabelas, criação de cards, manipulação de eventos.
  
  NÃO É TESTÁVEL com ferramentas convencionais de teste unitário.
  As funções deste arquivo dependem do jQuery e do Bootstrap para funcionarem corretamente.
*/

/**
 * Mapa para armazenar cores atribuídas a cada agendamento
 * Chave: string única identificando o agendamento
 * Valor: string com cor em formato HSL (ex: "hsl(180, 65%, 50%)")
 * Isso garante que cada agendamento mantenha a mesma cor na interface
 */
const coresAgendamentos = new Map();

/* ========== FUNÇÕES DE MODAL ========== */

/**
 * Abre o modal de cadastro de salas
 * Usa jQuery e Bootstrap para exibir o modal #modalum
 */
function cadastroSalas() {
  $('#modalum').modal('show'); // Método do Bootstrap para exibir modal
}

/**
 * Abre o modal de agendamento
 * Usa jQuery e Bootstrap para exibir o modal #modalAgendamento
 */
function abrirModalAgendamento() {
  $('#modalAgendamento').modal('show'); // Método do Bootstrap para exibir modal
}

/**
 * Abre o modal de consulta de cadastros de salas
 * Também configura os event listeners para os filtros
 * e atualiza a lista inicial de salas cadastradas
 */
function consultarCadastros() {
  $('#modaltres').modal('show'); // Abre o modal
  // Obtém os elementos HTML dos filtros
  const filtroBlocoEl = document.getElementById('filtroBloco');
  const filtroTipoEl = document.getElementById('filtroTipo');
  const filtroCapEl = document.getElementById('filtroCapacidade');
  
  // Adiciona event listeners para atualizar a lista quando os filtros mudarem
  // Usa 'change' para select e 'input' para campos de texto/número
  if (filtroBlocoEl) filtroBlocoEl.addEventListener('change', atualizarListaCadastros);
  if (filtroTipoEl) filtroTipoEl.addEventListener('change', atualizarListaCadastros);
  if (filtroCapEl) filtroCapEl.addEventListener('input', atualizarListaCadastros);

  // Atualiza a lista inicial de salas ao abrir o modal
  atualizarListaCadastros();
}

/**
 * Abre o modal de consulta de agendamentos
 * Configura os event listeners para os filtros de agendamentos
 * e atualiza a lista inicial de agendamentos
 */
function consultarAgendamentos() {
  $('#modaldois').modal('show'); // Abre o modal usando Bootstrap

  // Adiciona event listeners para os filtros de agendamento
  // Cada filtro atualiza os cards quando o usuário modifica os valores
  document.getElementById('filtroResponsavel').addEventListener('input', atualizarCardAgendamentos);
  document.getElementById('filtroBlocoAgendamento').addEventListener('change', atualizarCardAgendamentos);
  document.getElementById('filtroPeriodoAgendamento').addEventListener('change', atualizarCardAgendamentos);

  atualizarCardAgendamentos();
}

/* ========== ATUALIZAÇÃO DE LISTAS E CARDS ========== */

/**
 * Atualiza a lista de salas cadastradas no modal de consulta
 * Aplica os filtros selecionados e exibe os cards das salas correspondentes
 * É chamada automaticamente quando os filtros são modificados
 */
function atualizarListaCadastros() {
  // Obtém o corpo do modal onde serão exibidos os cards
  const modalBody = document.querySelector('#modaltres .modal-body');
  // Guarda a referência da div de filtros para não removê-la
  const filtrosDiv = modalBody.querySelector('.form-row');

  // Obtém os valores atuais dos filtros
  const blocoFiltro = document.getElementById('filtroBloco').value; // Ex: "Bloco A" ou "" (vazio = todos)
  const tipoFiltro = document.getElementById('filtroTipo').value; // Ex: "Laboratório" ou "" (vazio = todos)
  const capacidadeFiltro = parseInt(document.getElementById('filtroCapacidade').value) || 0; // Capacidade mínima, default 0

  // Remove todo o conteúdo anterior do modal, exceto os filtros
  // Isso evita duplicação de cards ao atualizar
  Array.from(modalBody.children).forEach(child => {
    if (child !== filtrosDiv) child.remove();
  });

  // Cria ou obtém o container onde os cards serão inseridos
  let cardsRow = modalBody.querySelector('.cards-container');
  if (!cardsRow) {
    cardsRow = document.createElement('div');
    cardsRow.className = 'row cards-container'; // Usa grid do Bootstrap
    modalBody.appendChild(cardsRow);
  }
  cardsRow.innerHTML = ''; // Limpa os cards anteriores

  // Chama a função de lógica (logica.js) para filtrar as salas
  // Retorna apenas as salas que atendem aos critérios dos filtros
  const salasFiltradas = filtrarSalas(salasCadastradas, {
    bloco: blocoFiltro,
    tipo: tipoFiltro,
    capacidade: capacidadeFiltro
  });

  // Se não houver salas filtradas, exibe uma mensagem informativa
  if (salasFiltradas.length === 0) {
    cardsRow.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          <i class="fas fa-info-circle mr-2"></i>
          ${
            // Verifica se é porque não existem salas ou porque os filtros não encontraram nada
            salasCadastradas.length === 0 
              ? 'Nenhuma sala cadastrada ainda.' 
              : 'Nenhuma sala corresponde aos filtros selecionados.'
          }
        </div>
      </div>`;
    return; // Interrompe a execução da função
  }
  
  // Cria um card para cada sala filtrada usando forEach
  salasFiltradas.forEach(sala => {
    // Cria uma coluna com layout responsivo do Bootstrap (col-md-6 = 2 cards por linha)
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-3'; // mb-3 = margin-bottom para espaçamento
    
    // Define o HTML do card usando template literals para inserir os dados da sala
    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${sala.bloco} - ${sala.sala}</h6>
          <span class="badge badge-light">${sala.tipo}</span>
        </div>
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <!--Ícone dinâmico baseado no tipo da sala-->
            <i class="fa ${
              sala.tipo === 'Laboratório' ? 'fa-desktop' : // Ícone de computador para laboratório
              sala.tipo === 'Auditório' ? 'fa-theater-masks' : // Ícone de teatro para auditório
              'fa-door-closed' // Ícone de porta para sala de aula
            }" style="font-size:2rem; color:#0d2e6d; margin-right: 15px;"></i>
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
            <!--Botão que chama a função excluirSala passando bloco e sala como parâmetros-->
            <button class="btn btn-outline-danger btn-sm" onclick="excluirSala('${sala.bloco}', '${sala.sala}')">
              <i class="fas fa-trash-alt mr-1"></i>Excluir
            </button>
          </div>
        </div>
      </div>
    `;
    cardsRow.appendChild(col); // Adiciona o card ao container
  });
}

/**
 * Função auxiliar que chama atualizarListaCadastros
 * Mantida para compatibilidade com código legado
 */
function filtrarCadastros() {
  atualizarListaCadastros();
}

/**
 * Cria um card HTML para exibir os dados de um agendamento
 * 
 * @param {Object} agendamento - Objeto contendo os dados do agendamento
 * @returns {HTMLDivElement} Elemento div contendo o card formatado
 * 
 * O card exibe: bloco, sala, período, responsável, disciplina e status (agendado/concluído)
 */
function criarCardAgendamento(agendamento) {
  // Cria um elemento div que será uma coluna do Bootstrap
  const card = document.createElement('div');
  card.className = 'col-md-6 mb-3'; // 2 cards por linha em telas médias e grandes
  
  // Formata as datas para o padrão brasileiro (DD/MM/AAAA)
  const dataFormatada = new Date(agendamento.dataInicial).toLocaleDateString('pt-BR');
  const dataFinalFormatada = new Date(agendamento.dataFinal).toLocaleDateString('pt-BR');
  
  // Determina se o agendamento já passou (status "CONCLUÍDO") ou ainda está por vir ("AGENDADO")
  const hoje = new Date();
  const dataAgendamento = new Date(agendamento.dataInicial);
  const statusClass = dataAgendamento < hoje ? 'bg-secondary' : 'bg-info'; // Cinza se passou, azul se futuro
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

/**
 * Atualiza a lista de cards de agendamentos no modal de consulta
 * Aplica os filtros selecionados (responsável, bloco, período)
 * e exibe os cards ordenados por data
 */
function atualizarCardAgendamentos() {
  // Obtém o container onde os cards serão exibidos
  const container = document.querySelector('#modaldois .cards-container');
  
  // Lê os valores atuais dos filtros
  const responsavel = document.getElementById('filtroResponsavel').value; // Nome do responsável
  const bloco = document.getElementById('filtroBlocoAgendamento').value; // Bloco selecionado
  const periodo = document.getElementById('filtroPeriodoAgendamento').value; // Manhã/Tarde/Noite

  // Chama a função de lógica para filtrar os agendamentos
  const agendamentosFiltrados = filtrarAgendamentos(agendamentos, { responsavel, bloco, periodo });

  // Limpa o conteúdo anterior do container
  container.innerHTML = '';

  // Se não houver agendamentos, exibe mensagem informativa
  if (agendamentosFiltrados.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          <i class="fas fa-info-circle mr-2"></i>
          Nenhum agendamento encontrado com os filtros selecionados.
        </div>
      </div>`;
    return; // Interrompe a execução
  }

  // Ordena os agendamentos por data (mais recentes primeiro)
  const agendamentosOrdenados = ordenarAgendamentos(agendamentosFiltrados);

  // Cria e adiciona um card para cada agendamento
  agendamentosOrdenados.forEach(agendamento => {
    container.appendChild(criarCardAgendamento(agendamento));
  });
}

/* ========== ATUALIZAÇÃO DE SELECTS ========== */

/**
 * Atualiza automaticamente o campo "tipo" quando uma sala é selecionada
 * Busca o tipo da sala nos dados cadastrados e preenche o select
 * 
 * @param {Event} event - Evento de mudança do select de sala
 */
function atualizarTipoSala(event) {
  const salaSelect = event.target; // Select que disparou o evento
  const blocoSelect = document.getElementById('blocoAgendamento');
  const tipoSelect = document.getElementById('tipoAgendamento');

  // Busca a sala selecionada no array de salas cadastradas
  const salaSelecionada = salasCadastradas.find(
    s => s.bloco === blocoSelect.value && s.sala === salaSelect.value
  );

  // Se encontrou a sala, atualiza o tipo automaticamente
  if (salaSelecionada) {
    tipoSelect.value = salaSelecionada.tipo;
  }
}

/**
 * Atualiza as opções do select de salas com base no bloco selecionado
 * Também gerencia o campo tipo quando o bloco é "Auditório"
 * 
 * @param {string} formulario - Nome do formulário ("Agendamento" ou vazio para cadastro)
 */
function atualizarSalas(formulario = '') {
  // Identifica os elementos HTML baseado no formulário
  let blocoSelect, salaSelect, tipoSelect;

  if (formulario === 'Agendamento') {
    // Elementos do formulário de agendamento
    blocoSelect = document.getElementById('blocoAgendamento');
    salaSelect = document.getElementById('salaAgendamento');
    tipoSelect = document.getElementById('tipoAgendamento');
  } else {
    // Elementos do formulário de cadastro
    blocoSelect = document.getElementById('bloco');
    salaSelect = document.getElementById('sala');
    tipoSelect = document.getElementById('tipo');
  }

  // Regra especial: Se o bloco é Auditório, força o tipo e desabilita o campo
  if (blocoSelect.value === 'Auditório') {
    tipoSelect.value = 'Auditório';
    tipoSelect.disabled = true; // Usuário não pode alterar
  } else {
    tipoSelect.disabled = false; // Permite alteração
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

/**
 * Renderiza a tabela semanal com todos os agendamentos.
 * Cria uma grade de horários vs dias da semana, preenchendo com agendamentos existentes.
 * Cada agendamento recebe uma cor única baseada em bloco-sala-horário-dia.
 */
function atualizarTabelaSemanal() {
  // Dias da semana abreviados para colunas
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Horários da grade (50min por aula, intervalos de 10-20min)
  const horarios = [
    '07:30', '08:20', '09:10', '10:10', '11:00', '11:50',
    '13:30', '14:20', '15:10', '16:20', '17:10', '18:00',
    '19:00', '19:50', '20:40', '21:30', '22:20', '23:00'
  ];

  coresAgendamentos.clear(); // Limpa cores antigas antes de regenerar

  // Início da estrutura HTML da tabela (table-sm = Bootstrap compacto, table-bordered = com bordas)
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

  // Para cada horário, criar uma linha com 7 colunas (1 hora + 6 dias)
  horarios.forEach(horario => {
    html += `<tr><td>${horario}</td>`;
    
    // Para cada dia da semana
    diasSemana.forEach(dia => {
      // Converter horário atual para minutos desde meia-noite (para comparação)
      const [horaAtual, minAtual] = horario.split(':').map(Number);
      const minutoAtual = horaAtual * 60 + minAtual;

      // Filtrar agendamentos que ocupam este horário + dia
      const agendamentosHorario = agendamentos.filter(ag => {
        // Converter horários do agendamento para minutos
        const [horaInicio, minInicio] = ag.horaInicial.split(':').map(Number);
        const [horaFim, minFim] = ag.horaFinal.split(':').map(Number);
        const minutoInicio = horaInicio * 60 + minInicio;
        const minutoFim = horaFim * 60 + minFim;

        // Comparar dia (agendamento armazena "Segunda", "Terça", etc - pegar 3 primeiras letras)
        const diaAbreviado = ag.diaSemana.substring(0, 3);

        // Verifica se: mesmo dia E horário atual está dentro do intervalo [início, fim)
        return diaAbreviado === dia &&
               minutoAtual >= minutoInicio &&
               minutoAtual < minutoFim;
      });

      if (agendamentosHorario.length > 0) {
        // Há agendamento neste horário+dia - renderizar célula preenchida
        const ag = agendamentosHorario[0]; // Pega primeiro (validação garante não haver conflitos)
        
        // Gerar chave única para este agendamento (mesma cor para todas as células do mesmo agendamento)
        const chaveAgendamento = `${ag.bloco}-${ag.sala}-${ag.horaInicial}-${ag.diaSemana}`;
        if (!coresAgendamentos.has(chaveAgendamento)) {
          coresAgendamentos.set(chaveAgendamento, gerarCorAleatoria()); // Gera cor aleatória apenas uma vez
        }
        const corAgendamento = coresAgendamentos.get(chaveAgendamento);
        
        // Célula com cor de fundo, mostra sala e disciplina/nome
        html += `<td class="text-white small p-1" style="font-size: 0.8rem; background-color: ${corAgendamento}">
          ${ag.bloco}-${ag.sala}<br>
          <span style="font-size: 0.7rem;">${ag.disciplina || ag.nome}</span>
        </td>`;
      } else {
        // Célula vazia (sem agendamento)
        html += '<td class="p-1"></td>';
      }
    });
    html += '</tr>';
  });

  // Fecha estrutura HTML da tabela
  html += `
        </tbody>
      </table>
    </div>
  `;

  // Renderiza no DOM (substitui HTML do container)
  const container = document.querySelector('.table-responsive');
  container.innerHTML = html;
}

/* ========== HANDLERS DE FORMULÁRIO ========== */

/**
 * Processa o formulário de cadastro de sala.
 * @param {Event} event - Evento de submit do formulário
 */
function cadastrarSala(event) {
  event.preventDefault(); // Impede reload da página

  // Capturar valores dos campos do formulário
  const bloco = document.getElementById('bloco').value;
  const sala = document.getElementById('sala').value;
  const capacidade = parseInt(document.getElementById('capacidade').value);
  const tipo = document.getElementById('tipo').value;

  // Validar usando função da lógica (verifica duplicatas, bloco Auditório, etc)
  const validacao = validarCadastroSala(bloco, sala, capacidade, tipo, salasCadastradas);
  
  if (!validacao.valido) {
    alert(validacao.erro); // Exibe mensagem de erro ao usuário
    return;
  }

  // Forçar tipo se for Auditório (regra de negócio especial)
  const tipoFinal = bloco === 'Auditório' ? 'Auditório' : tipo;

  // Adicionar sala ao array global e persistir no localStorage/IndexedDB
  adicionarSala({ bloco, sala, capacidade, tipo: tipoFinal });
  salvarSalasCadastradas();

  // Feedback ao usuário e fechar modal Bootstrap
  alert('Sala cadastrada com sucesso!');
  $('#modalum').modal('hide'); // Método jQuery do Bootstrap
  event.target.reset(); // Limpar campos do formulário
}

/**
 * Processa o formulário de agendamento de sala.
 * @param {Event} event - Evento de submit do formulário
 */
const realizarAgendamento = function(event) {
  event.preventDefault(); // Impede reload da página

  // Capturar todos os valores do formulário de agendamento
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
  const capacidade = parseInt(document.getElementById('capacidadeAgendamento').value) || 0; // Default 0 se vazio

  // Validar agendamento (verifica conflitos, horários, capacidade, etc)
  const validacao = validarAgendamento(
    { bloco, sala, dataInicial, horaInicial, horaFinal, capacidade },
    agendamentos
  );

  if (!validacao.valido) {
    alert(validacao.erro); // Exibe mensagem de erro ao usuário
    return;
  }

  // Adicionar agendamento ao array global (validacao.diaSemana calculado automaticamente)
  adicionarAgendamento({
    bloco,
    sala,
    tipo,
    dataInicial,
    dataFinal,
    diaSemana: validacao.diaSemana, // Dia da semana calculado pela validação
    horaInicial,
    horaFinal,
    cpf,
    nome,
    disciplina
  });

  // Persistir no localStorage/IndexedDB
  salvarAgendamentos();
  
  // Feedback ao usuário
  alert('Agendamento realizado com sucesso!');
  $('#modalAgendamento').modal('hide'); // Fechar modal Bootstrap
  atualizarTabelaSemanal(); // Atualizar visualização da tabela
};

/**
 * Exclui uma sala cadastrada.
 * @param {string} bloco - Bloco da sala (A, B, C, Auditório)
 * @param {string} numeroSala - Número da sala
 */
function excluirSala(bloco, numeroSala) {
  removerSala(bloco, numeroSala); // Remove do array global
  salvarSalasCadastradas(); // Persiste no localStorage/IndexedDB
  alert('Sala excluída com sucesso!'); // Feedback ao usuário
  atualizarListaCadastros(); // Atualiza visualização dos cards
}

/**
 * Exclui um agendamento existente após confirmação.
 * @param {string} dataAgendamento - Data do agendamento (YYYY-MM-DD)
 * @param {string} sala - Número da sala agendada
 * @param {string} horaInicial - Horário inicial (HH:MM)
 */
function excluirAgendamento(dataAgendamento, sala, horaInicial) {
  // Confirmar exclusão (evitar exclusões acidentais)
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    removerAgendamento(dataAgendamento, sala, horaInicial); // Remove do array global
    salvarAgendamentos(); // Persiste no localStorage/IndexedDB
    consultarAgendamentos(); // Atualiza visualização dos cards na página de consulta
    atualizarTabelaSemanal(); // Atualiza tabela semanal
  }
}

/* ========== INICIALIZAÇÃO ========== */

/**
 * Inicializa a aplicação quando o DOM estiver completamente carregado.
 * Configura event listeners e carrega dados persistidos.
 */
document.addEventListener('DOMContentLoaded', function() {
  // Carregar dados persistidos do localStorage/IndexedDB para arrays globais
  carregarSalasCadastradas();
  carregarAgendamentos();

  // Configurar event listener para formulário de cadastro de salas
  const formCadastro = document.querySelector('#modalum form');
  if (formCadastro) {
    formCadastro.addEventListener('submit', function(e) {
      e.preventDefault(); // Impede submit padrão
      cadastrarSala(e); // Chama handler customizado
    });
  }

  // Configurar event listener para formulário de agendamento
  const formAgendamento = document.querySelector('#modalAgendamento form');
  if (formAgendamento) {
    formAgendamento.addEventListener('submit', realizarAgendamento);
  }

  // Renderizar tabela semanal inicial
  atualizarTabelaSemanal();

  // Configurar auto-preenchimento de tipo quando sala é selecionada
  const salaAgendamentoSelect = document.getElementById('salaAgendamento');
  if (salaAgendamentoSelect) {
    salaAgendamentoSelect.addEventListener('change', atualizarTipoSala);
  }
});
