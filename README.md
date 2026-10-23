<div align="center">

```
███████╗███████╗ ██████╗ ██╗████████╗
██╔════╝╚══███╔╝██╔════╝ ██║╚══██╔══╝
█████╗    ███╔╝ ██║  ███╗██║   ██║   
██╔══╝   ███╔╝  ██║   ██║██║   ██║   
███████╗███████╗╚██████╔╝██║   ██║   
╚══════╝╚══════╝ ╚═════╝ ╚═╝   ╚═╝
```

# ezgit

**Interface de linha de comando para automação e padronização de fluxos de trabalho no Git e GitHub**

</div>

---

## Visão Geral

O **ezgit** é uma ferramenta CLI voltada para otimizar, padronizar e automatizar rotinas do Git e integrações com o GitHub em ambientes de desenvolvimento. Por meio de menus guiados, a ferramenta reduz erros operacionais e garante conformidade com convenções do mercado.

### Recursos Principais

* **Padronização de Commits:** Implementação nativa da especificação Conventional Commits (com escopo e tipo).
* **Fluxo Interativo de Push:** Validação de repositório, inspeção de *diff*, suporte a *pull rebase* e confirmação antes do envio.
* **Integração com GitHub API:** Criação de repositórios, abertura de Pull Requests e consulta de *issues* diretamente pelo terminal.
* **Gerenciamento de Branches e Histórico:** Operações de criação, remoção, troca e visualização avançada de logs coloridos.
* **Reversão Segura:** Desfaz alterações via `undo` com suporte aos modos Soft, Mixed e Hard.
* **Histórico de Mensagens:** Persistência de mensagens recentes para reutilização no terminal.

## Pré-requisitos

| Requisito | Versão Mínima | Comando de Verificação |
| --- | --- | --- |
| **Node.js** | `>= 18.0.0` | `node --version` |
| **npm** | `>= 8.0.0` | `npm --version` |
| **Git** | Qualquer versão ativa | `git --version` |

*Observação para usuários Windows:* Certifique-se de que o executável do Git esteja incluído nas variáveis de ambiente (`PATH`).

## Instalação

1. Clone o repositório localmente:

   ```bash
   git clone https://github.com/seu-usuario/ezgit.git
   cd ezgit
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Vincule o executável globalmente no ambiente Node.js:

   ```bash
   npm link
   ```

## Guia de Uso

### Comando Principal

Para iniciar o fluxo guiado de commit e envio de alterações:

```bash
ezgit
```

**Etapas do processo:**

1. Validação de repositório Git local (oferece inicialização se necessário).
2. Verificação do estado dos arquivos (`git status`).
3. Seleção de branch ativa.
4. Exibição do resumo de alterações (`git diff --stat`).
5. Opção de sincronização prévia (`git pull --rebase`).
6. Definir tipo e escopo da alteração conforme a convenção.
7. Entrada de mensagem com opção de reaproveitamento do histórico.
8. Confirmação e execução sequencial (`git add`, `git commit`, `git push`).

### Comandos Auxiliares

#### Visualização de Logs

Exibe o histórico recente categorizado por tipo de commit, autor, data e referências.

```bash
ezgit log
```

#### Gerenciamento de Branches

Acessa o menu de gerenciamento (listar, criar, alternar, renomear e excluir).

```bash
ezgit branch
```

#### Reversão de Commits

Desfaz o último commit executado.

```bash
ezgit undo
```

* **Soft:** Mantém as alterações no diretório de *stage*.
* **Mixed:** Mantém as alterações no diretório de trabalho (*working directory*).
* **Hard:** Remove permanentemente as alterações (requer confirmação adicional).

#### Integração com GitHub

Acessa as funcionalidades conectadas à API do GitHub.

```bash
ezgit github
# ou
ezgit gh
```

**Opções disponíveis:**

* Autenticação via Personal Access Token (armazenado em `~/.ezgitrc`).
* Consulta de perfil e repositórios.
* Criação de novos repositórios remotos com associação automática da origin.
* Abertura de Pull Requests (incluindo suporte a rascunhos / *drafts*).
* Consulta de *issues* em aberto.

## Padrão de Commits (Conventional Commits)

O projeto adota a convenção [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo | Finalidade |
| --- | --- |
| `feat` | Adição de nova funcionalidade |
| `fix` | Correção de problemas/bugs |
| `docs` | Alterações em documentação |
| `refactor` | Mudança de código sem alteração de comportamento |
| `style` | Formatação de código e espaçamentos |
| `test` | Criação ou ajuste de suítes de teste |
| `chore` | Tarefas de manutenção, dependências e configurações |
| `perf` | Melhorias de desempenho |
| `ci` | Alterações em scripts e arquivos de integração contínua |

**Exemplo de estrutura:**

```text
feat(auth): adiciona suporte a autenticação OAuth2
fix(api): corrige tratamento de exceções na rota de login
```

## Estrutura do Diretório

```text
ezgit/
├── index.js                  # Ponto de entrada e roteamento de comandos
├── package.json              # Mapeamento de dependências e scripts
├── README.md                 # Documentação técnica do projeto
└── src/
    ├── commands/             # Implementação das rotas da CLI
    │   ├── push.js           # Fluxo de commit e push
    │   ├── log.js            # Visualizador de log
    │   ├── branch.js         # Operações de branch
    │   ├── undo.js           # Reversão de commits
    │   └── github.js         # Cliente para a API do GitHub
    └── utils/                # Módulos utilitários
        ├── style.js          # Estilização visual no terminal
        ├── git.js            # Wrapper de comandos de sistema do Git
        └── config.js         # Gerenciamento do arquivo de configuração (~/.ezgitrc)
```

## Resolução de Problemas

### Git não reconhecido no terminal Windows

Verifique se a instalação do Git adicionou os executáveis ao `PATH` do sistema. Reinstale utilizando o instalador oficial e marque a opção para disponibilizar o Git via linha de comando.

### Rejeição no envio do repositório remoto (`push`)

Ocorre quando há *commits* no servidor remoto não presentes localmente. Execute a sincronização manual:

```bash
git pull origin <nome-da-branch> --rebase
```

### Ausência de repositório remoto (`origin`)

Adicione o destino manualmente ou utilize a opção de criação de repositórios da CLI:

```bash
git remote add origin https://github.com/usuario/repositorio.git
```

## Planejamento de Desenvolvimento (Roadmap)

- [x] Interface de commit e push com validações.
- [x] Suporte a Conventional Commits.
- [x] Integração completa com API do GitHub.
- [x] Sistema de reversão de commits com segurança.
- [ ] Suporte a gerenciamento de `git stash`.
- [ ] Automação do versionamento através de `git tag`.
- [ ] Validação de arquivos sensíveis no `.gitignore` antes do commit.
- [ ] Flag de execução simular (`--dry-run`).
