// Abrir modais
function cadastroSalas() {
  $('#modalum').modal('show');
}

function realizarAgendamento() {
  $('#modalquatro').modal('show');
}

function consultarAgendamentos() {
  $('#modaldois').modal('show');
}

function consultarCadastros() {
  $('#modaltres').modal('show');
}

// Dados de salas por bloco
const salasPorBloco = {
  "Bloco A": ["A1", "A2", "A3"],
  "Bloco B": ["B101", "B201", "B301"],
  "Bloco C": ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"],
  "Bloco D": ["D1", "D2", "D3", "D4"],
  "Bloco E": ["E101", "E102", "E103"],
  "Bloco F": ["F101", "F102", "F201", "F202", "F203"],
  "Bloco G": ["G1", "G2", "G3"]
};

// Atualizar lista de salas ao escolher o bloco
// Passa os IDs dos selects como parâmetros para funcionar em qualquer modal
function atualizarSalas(blocoSelectId, salaSelectId) {
  const blocoSelect = document.getElementById(blocoSelectId);
  const salaSelect = document.getElementById(salaSelectId);
  const blocoSelecionado = blocoSelect.value;

  salaSelect.innerHTML = '';

  if (!blocoSelecionado || !salasPorBloco[blocoSelecionado]) {
    salaSelect.innerHTML = '<option disabled selected>Selecione o bloco primeiro</option>';
    return;
  }

  salasPorBloco[blocoSelecionado].forEach(sala => {
    const option = document.createElement('option');
    option.value = sala;
    option.textContent = sala;
    salaSelect.appendChild(option);
  });
}