

class DataHandler {
    constructor() {
        this.db = null;
        this.ready = false;

        const request = indexedDB.open("AgendamentoPolytechDB", 1);

        request.onsuccess = (event) => {
            this.db = event.target.result;
            this.ready = true;
            console.log("Banco de dados IndexedDB pronto!");
            
            // Carregar dados para os arrays globais
            this.carregarDadosIniciais();
        };

        request.onerror = (event) => {
            console.error("Não foi possível abrir o banco de dados IndexedDB!");
            console.error("Código do erro:", event.target.errorCode);
            this.ready = false;
            
            // Fallback para localStorage se IndexedDB falhar
            console.log("Usando localStorage como fallback...");
            carregarSalasCadastradas();
            carregarAgendamentos();
        };

        // Caso a versão do banco de dados seja diferente da armazenada no computador local
        request.onupgradeneeded = (event) => {
            this.db = event.target.result;

            // Object Store para SALAS
            if (!this.db.objectStoreNames.contains("salas")) {
                let salaStore = this.db.createObjectStore("salas", {
                    keyPath: "id",
                    autoIncrement: true
                });

                // Índices para facilitar buscas
                salaStore.createIndex("bloco", "bloco", { unique: false });
                salaStore.createIndex("sala", "sala", { unique: false });
                salaStore.createIndex("tipo", "tipo", { unique: false });
                salaStore.createIndex("blocoSala", ["bloco", "sala"], { unique: true });
                
                console.log("Object Store 'salas' criado!");
            }

            // Object Store para AGENDAMENTOS
            if (!this.db.objectStoreNames.contains("agendamentos")) {
                let agendamentoStore = this.db.createObjectStore("agendamentos", {
                    keyPath: "id",
                    autoIncrement: true
                });

                // Índices para facilitar buscas
                agendamentoStore.createIndex("bloco", "bloco", { unique: false });
                agendamentoStore.createIndex("sala", "sala", { unique: false });
                agendamentoStore.createIndex("dataInicial", "dataInicial", { unique: false });
                agendamentoStore.createIndex("nome", "nome", { unique: false });
                agendamentoStore.createIndex("cpf", "cpf", { unique: false });
                
                console.log("Object Store 'agendamentos' criado!");
            }
            
            console.log("Atualização do banco de dados IndexedDB pronta!");
        };

        if (this.db !== null) {
            this.db.onerror = (event) => {
                console.error(`Erro de IndexedDB: ${event.target.error?.message}`);
            };
        }
    }

    isReady() {
        return this.ready && this.db;
    }

    // ========== CARREGAR DADOS INICIAIS ==========
    
    carregarDadosIniciais() {
        this.loadAllSalas((salas) => {
            if (salas && salas.length > 0) {
                salasCadastradas.length = 0;
                salasCadastradas.push(...salas);
                console.log(`${salas.length} salas carregadas do IndexedDB`);
            }
        });

        this.loadAllAgendamentos((agends) => {
            if (!window.agendamentos) window.agendamentos = []; // ← SEGUNDA COISA

            if (agends && agends.length > 0) {
                agendamentos.length = 0;
                agendamentos.push(...agends);
                console.log(`${agends.length} agendamentos carregados do IndexedDB`);
            }
            // Atualizar tabela após carregar
            if (typeof atualizarTabelaSemanal === 'function') {
                atualizarTabelaSemanal();
            }
        });
    }

    // ========== OPERAÇÕES COM SALAS ==========

    saveSala(sala, callback) {
        if (!this.isReady()) {
            callback && callback("Banco de dados não está pronto");
            return;
        }

        const transaction = this.db.transaction("salas", "readwrite");
        const objectStore = transaction.objectStore("salas");

        // Remover id se já existir (para evitar conflitos)
        const salaParaSalvar = { ...sala };
        if (salaParaSalvar.id) delete salaParaSalvar.id;

        const request = objectStore.add(salaParaSalvar);

        request.onsuccess = () => {
            let message = `Sala ${sala.bloco} - ${sala.sala} salva no IndexedDB!`;
            console.log(message);
            callback && callback(null, message);
        };

        request.onerror = (event) => {
            let message = `Erro ao salvar sala: ${event.target.error?.message}`;
            console.error(message);
            callback && callback(message);
        };
    }

    loadSala(bloco, sala, callback) {
        if (!this.isReady()) {
            callback && callback("Banco de dados não está pronto");
            return;
        }

        const transaction = this.db.transaction(["salas"]);
        const objectStore = transaction.objectStore("salas");
        const index = objectStore.index("blocoSala");
        const request = index.get([bloco, sala]);

        request.onerror = (event) => {
            let message = `Erro ao recuperar sala: ${event.target.error?.message}`;
            console.error(message);
            callback && callback(message);
        };

        request.onsuccess = (event) => {
            if (request.result) {
                callback && callback(null, request.result);
            } else {
                callback && callback("Sala não encontrada");
            }
        };
    }

    removeSala(bloco, sala, callback) {
        if (!this.isReady()) {
            callback && callback("Banco de dados não está pronto");
            return;
        }

        // Primeiro encontrar o ID da sala
        this.loadSala(bloco, sala, (err, salaEncontrada) => {
            if (err || !salaEncontrada) {
                callback && callback("Sala não encontrada para remover");
                return;
            }

            const transaction = this.db.transaction("salas", "readwrite");
            const objectStore = transaction.objectStore("salas");
            const request = objectStore.delete(salaEncontrada.id);

            request.onsuccess = () => {
                let message = `Sala ${bloco} - ${sala} removida do IndexedDB!`;
                console.log(message);
                callback && callback(null, message);
            };

            request.onerror = (event) => {
                let message = `Erro ao remover sala: ${event.target.error?.message}`;
                console.error(message);
                callback && callback(message);
            };
        });
    }

    loadAllSalas(callback) {
        if (!this.isReady()) {
            callback && callback([]);
            return;
        }

        const transaction = this.db.transaction(["salas"], "readonly");
        const objectStore = transaction.objectStore("salas");
        const request = objectStore.getAll();

        request.onerror = (event) => {
            console.error(`Erro ao recuperar salas: ${event.target.error?.message}`);
            callback && callback([]);
        };

        request.onsuccess = () => {
            callback && callback(request.result || []);
        };
    }

    // ========== OPERAÇÕES COM AGENDAMENTOS ==========

    saveAgendamento(agendamento, callback) {
        if (!this.isReady()) {
            callback && callback("Banco de dados não está pronto");
            return;
        }

        const transaction = this.db.transaction("agendamentos", "readwrite");
        const objectStore = transaction.objectStore("agendamentos");

        // Remover id se já existir
        const agendamentoParaSalvar = { ...agendamento };
        if (agendamentoParaSalvar.id) delete agendamentoParaSalvar.id;

        const request = objectStore.add(agendamentoParaSalvar);

        request.onsuccess = () => {
            let message = `Agendamento de ${agendamento.nome} salvo no IndexedDB!`;
            console.log(message);
            callback && callback(null, message);
        };

        request.onerror = (event) => {
            let message = `Erro ao salvar agendamento: ${event.target.error?.message}`;
            console.error(message);
            callback && callback(message);
        };
    }

    removeAgendamento(dataAgendamento, sala, horaInicial, callback) {
        if (!this.isReady()) {
            callback && callback("Banco de dados não está pronto");
            return;
        }

        // Buscar o agendamento que corresponde aos critérios
        this.loadAllAgendamentos((agends) => {
            const agendamento = agends.find(ag =>
                ag.dataAgendamento === dataAgendamento &&
                ag.sala === sala &&
                ag.horaInicial === horaInicial
            );

            if (!agendamento) {
                callback && callback("Agendamento não encontrado");
                return;
            }

            const transaction = this.db.transaction("agendamentos", "readwrite");
            const objectStore = transaction.objectStore("agendamentos");
            const request = objectStore.delete(agendamento.id);

            request.onsuccess = () => {
                let message = `Agendamento removido do IndexedDB!`;
                console.log(message);
                callback && callback(null, message);
            };

            request.onerror = (event) => {
                let message = `Erro ao remover agendamento: ${event.target.error?.message}`;
                console.error(message);
                callback && callback(message);
            };
        });
    }

    loadAllAgendamentos(callback) {
        if (!this.isReady()) {
            callback && callback([]);
            return;
        }

        const transaction = this.db.transaction(["agendamentos"], "readonly");
        const objectStore = transaction.objectStore("agendamentos");
        const request = objectStore.getAll();

        request.onerror = (event) => {
            console.error(`Erro ao recuperar agendamentos: ${event.target.error?.message}`);
            callback && callback([]);
        };

        request.onsuccess = () => {
            callback && callback(request.result || []);
        };
    }

    // ========== LIMPAR BANCO ==========

    clearAll(callback) {
        if (!this.isReady()) {
            callback && callback("Banco de dados não está pronto");
            return;
        }

        const transaction = this.db.transaction(["salas", "agendamentos"], "readwrite");
        
        transaction.objectStore("salas").clear();
        transaction.objectStore("agendamentos").clear();

        transaction.oncomplete = () => {
            console.log("Banco de dados limpo!");
            callback && callback(null, "Dados limpos com sucesso");
        };

        transaction.onerror = (event) => {
            console.error("Erro ao limpar banco:", event.target.error?.message);
            callback && callback("Erro ao limpar dados");
        };
    }
}

/* exportado dataHandler */
// Instância global do DataHandler
let dataHandler = null;

// Inicializar IndexedDB quando o documento carregar
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Inicializando IndexedDB...");
        dataHandler = new DataHandler();
    });
}

// Exportar para testes Node.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = { DataHandler };
}
