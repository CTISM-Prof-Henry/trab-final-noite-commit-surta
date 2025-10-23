# 🧩 Tutorial de Instalação e Configuração do Ambiente

Este guia mostra passo a passo como instalar tudo o que é necessário para rodar o projeto usando **VS Code** como ambiente de desenvolvimento.

---

## 📦 1. Baixar os aplicativos necessários

### 🔹 1.1 Instalar o Python

1. Acesse: [https://www.python.org/downloads/](https://www.python.org/downloads/)

2. Baixe a versão **Python 3.10 ou superior**.

3. Durante a instalação, **marque a opção "Add Python to PATH"**.

4. Após instalar, verifique no terminal:

   ```bash
   python --version

### 🔹 1.2 Instalar o Git

5. Acesse: https://git-scm.com/downloads

6. Instale normalmente (as opções padrão funcionam bem).

7. Depois teste:

    git --version

### 🔹 1.3 Instalar o VS Code

8. Vá em https://code.visualstudio.com/

9. Baixe e instale a versão para seu sistema.

10. Ao abrir o VS Code, instale as extensões recomendadas:

    Python (by Microsoft)
    Pylance
    GitHub Pull Requests and Issues
    (Opcional) Material Icon Theme
    (Opcional) Markdown All in One

## 💾 2. Clonar o repositório do projeto

No VS Code:
    Pressione Ctrl + Shift + P → procure por Git: Clone.
    Cole o link do repositório:
    
            https://github.com/CTISM-Prof-Henry/trab-final-noite-commit-surta.git

    Escolha uma pasta local para salvar o projeto.
    Ou, no terminal:

            git clone https://github.com/Rossini04/NOME_DO_REPOSITORIO.git
            cd NOME_DO_REPOSITORIO

## ⚙️ 3. Instalar as dependências do projeto

    Isso instalará todas as bibliotecas necessárias listadas no arquivo requirements.txt.

        pip install -r requirements.txt

## 🧩 4. Rodar o MkDocs (para visualizar a documentação)

Dentro da pasta raiz do projeto (onde está o mkdocs.yml):
    mkdocs serve

Abra o navegador e acesse:

👉 http://127.0.0.1:8000


