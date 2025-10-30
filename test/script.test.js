const { atualizarSalas, salasPorBloco } = require("../JavaScript/index.js");
const { JSDOM } = require("jsdom");

QUnit.module("Testes de atualização de salas", hooks => {
  let dom, document;

  hooks.beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><html><body>
      <select id="bloco">
        <option value="Bloco C" selected>Bloco C</option>
      </select>
      <select id="sala"></select>
    </body></html>`);
    document = dom.window.document;
    global.document = document;
  });

  QUnit.test("Deve preencher corretamente as salas do Bloco C", assert => {
    atualizarSalas();
    const options = document.querySelectorAll("#sala option");
    assert.ok(options.length > 0, "Salas foram adicionadas");
    assert.equal(options[0].value, "C1", "Primeira sala correta");
  });

  QUnit.test("Deve mostrar aviso quando bloco não for selecionado", assert => {
    document.getElementById("bloco").value = "";
    atualizarSalas();
    const option = document.querySelector("#sala option");
    assert.ok(option.disabled, "Mostra mensagem de aviso");
    assert.ok(option.textContent.includes("Selecione o bloco"), "Mensagem correta");
  });
});
