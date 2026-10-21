<div align="center">

# ezgit 🚀

**CLI interativa para automatizar seu fluxo Git & GitHub com estilo**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-ezgit-CB3837?style=flat-square&logo=npm)](https://www.npmjs.com)
[![License](https://img.shields.io/badge/license-MIT-7AA2F7?style=flat-square)](./LICENSE)
[![ES Modules](https://img.shields.io/badge/ES-Modules-F7768E?style=flat-square)](https://nodejs.org/api/esm.html)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-E0AF68?style=flat-square)](https://conventionalcommits.org)

</div>

---

## ✨ O que é o ezgit?

O `ezgit` é uma ferramenta de linha de comando (CLI) que transforma sua rotina com Git em uma experiência interativa, colorida e muito mais simples. Esqueça memorizar comandos — só navegar pelos menus.

- 📋 **Menus interativos** para todas as ações
- 🎨 **Saída colorida** e humanamente legível
- ⚡ **Loaders animados** em cada etapa
- 🔐 **Integração com a GitHub API** (criar repos, PRs, ver issues)
- 📝 **Conventional Commits** com tipos e escopos
- 🕐 **Histórico de mensagens** para reutilizar commits recentes

---

## 📋 Pré-requisitos

| Requisito | Versão mínima | Como verificar |
|---|---|---|
| **Node.js** | `>= 18.0.0` | `node --version` |
| **npm** | `>= 8.0.0` | `npm --version` |
| **Git** | qualquer | `git --version` |

> ⚠️ **Windows**: Certifique-se de que o `git` está no PATH do sistema. Instale pelo [Git for Windows](https://git-scm.com/download/win) e reinicie o terminal após a instalação.

---

## 📦 Instalação

### 1. Clone ou baixe o projeto

```bash
git clone https://github.com/seu-usuario/ezgit.git
cd ezgit
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Vincule globalmente (permite usar `ezgit` em qualquer pasta)

```bash
npm link
```

> Pronto! O comando `ezgit` estará disponível em qualquer diretório do seu sistema.

---

## 🚀 Uso

### Comando principal — Commit + Push interativo

```bash
ezgit
```

Fluxo completo:
1. ✅ Verifica se é um repositório Git (oferece `git init` se não for)
2. 🔍 Checa alterações pendentes (`git status`)
3. 🌿 Seletor de branch (se houver mais de uma)
4. 📊 Exibe `git diff --stat` (resumo visual das mudanças)
5. ⬇️ Pergunta se quer fazer `git pull --rebase` antes
6. 🏷️ Seleção de tipo de commit (Conventional Commits)
7. 🔖 Campo de escopo opcional (ex: `feat(auth): ...`)
8. ✍️ Mensagem do commit com histórico de sugestões
9. 📋 Resumo final com confirmação
10. 🚀 Executa: `git add .` → `git commit` → `git push`

---

### `ezgit log` — Histórico de commits colorido

```bash
ezgit log
```

Exibe os últimos commits com cores por tipo, autor, data e refs (HEAD, origin, tags). Escolha entre 10, 20, 50 ou 100 commits.

---

### `ezgit branch` — Gerenciar branches

```bash
ezgit branch
```

| Opção | Descrição |
|---|---|
| **Listar** | Mostra todas as branches locais com indicador da atual |
| **Criar** | Cria nova branch com validação de nome + opção de já trocar |
| **Trocar** | Menu de seleção para mudar de branch |
| **Deletar** | Remove branch com confirmação obrigatória |
| **Renomear** | Renomeia a branch atual |

---

### `ezgit undo` — Desfazer o último commit

```bash
ezgit undo
```

| Modo | Comportamento |
|---|---|
| **Soft** | Desfaz o commit, mantém arquivos **no stage** (mais seguro) |
| **Mixed** | Desfaz o commit, arquivos ficam fora do stage (padrão Git) |
| **Hard** | ⚠️ Desfaz o commit **e apaga todas as mudanças** (pede confirmação dupla) |

---

### `ezgit github` — Integração com GitHub API

```bash
ezgit github
# ou
ezgit gh
```

| Funcionalidade | Descrição |
|---|---|
| 🔑 **Configurar Token** | Salva seu Personal Access Token (validado na hora) |
| 👤 **Meu Perfil** | Exibe dados da sua conta GitHub |
| 📁 **Meus Repositórios** | Lista seus últimos 20 repos com linguagem e estrelas |
| ➕ **Criar Repositório** | Cria repo no GitHub e configura como `origin` |
| 🔀 **Criar Pull Request** | Abre PR com título, descrição, branch base e suporte a draft |
| 🐛 **Listar Issues** | Exibe issues abertas do repositório atual |

#### Como configurar o token GitHub

1. Acesse: [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. Selecione os escopos: `repo`, `workflow`, `read:user`
3. Gere e copie o token (começa com `ghp_` ou `github_pat_`)
4. Execute `ezgit github` → **Configurar Token** e cole o token

> O token é salvo em `~/.ezgitrc` (somente no seu computador, nunca compartilhado).

---

### `ezgit --help` — Ajuda

```bash
ezgit --help
# ou
ezgit help
ezgit -h
```

---

## 🏷️ Tipos de Commit (Conventional Commits)

| Tipo | Emoji | Quando usar |
|---|---|---|
| `feat` | ✨ | Nova funcionalidade |
| `fix` | 🐛 | Correção de bug |
| `docs` | 📝 | Mudanças na documentação |
| `refactor` | ♻️ | Refatoração sem mudar comportamento |
| `style` | 💅 | Formatação, espaços, ponto e vírgula |
| `test` | 🧪 | Adicionar ou corrigir testes |
| `chore` | 🔧 | Manutenção, build, dependências |
| `perf` | ⚡ | Melhoria de performance |
| `ci` | 🤖 | Mudanças em CI/CD |

**Exemplo com escopo:**
```
feat(auth): adiciona login com Google
fix(api): corrige tratamento de erro 401
docs(readme): atualiza instruções de instalação
```

---

## 📁 Estrutura do Projeto

```
ezgit/
├── index.js                  ← Ponto de entrada + roteador de comandos
├── package.json
├── README.md
└── src/
    ├── commands/
    │   ├── push.js           ← Fluxo de commit + push
    │   ├── log.js            ← Histórico de commits
    │   ├── branch.js         ← Gerenciamento de branches
    │   ├── undo.js           ← Desfazer commits
    │   └── github.js         ← Integração com GitHub API
    └── utils/
        ├── style.js          ← Cores, ícones, banner, tipos de commit
        ├── git.js            ← Funções Git utilitárias
        └── config.js         ← Configuração persistente (~/.ezgitrc)
```

---

## ⚙️ Configuração Persistente

O `ezgit` salva preferências em `~/.ezgitrc` (arquivo JSON no seu diretório home):

```json
{
  "history": [
    "adiciona autenticação com Google",
    "corrige erro de validação no formulário"
  ],
  "githubToken": "ghp_..."
}
```

| Campo | Descrição |
|---|---|
| `history` | Últimas 20 mensagens de commit para sugestão |
| `githubToken` | Token de acesso à GitHub API |

---

## 🛠️ Dependências

| Pacote | Versão | Uso |
|---|---|---|
| [`@clack/prompts`](https://github.com/natemoo-re/clack) | `^0.9.1` | Prompts interativos, spinners, menus |
| [`chalk`](https://github.com/chalk/chalk) | `^5.3.0` | Colorização do terminal |
| [`execa`](https://github.com/sindresorhus/execa) | `^9.3.0` | Execução de comandos Git |

---

## 🚧 Solução de Problemas

### ❌ `git não é reconhecido como um comando` (Windows)

O Git não está no PATH do sistema.

**Solução:**
1. Instale o [Git for Windows](https://git-scm.com/download/win)
2. Durante a instalação, selecione **"Git from the command line and also from 3rd-party software"**
3. Reinicie o terminal (ou o computador)
4. Verifique com: `git --version`

---

### ❌ Push rejeitado

```
✘  Push rejeitado! Existem commits remotos não baixados.
```

**Solução:**
```bash
git pull origin main --rebase
# depois tente novamente:
ezgit
```

---

### ❌ Sem remote configurado

```
✘  Nenhum remote 'origin' configurado.
```

**Solução:**
```bash
git remote add origin https://github.com/seu-usuario/seu-repo.git
# ou use:
ezgit github  # → Criar Repositório (configura origin automaticamente)
```

---

### ❌ Falha de autenticação no push

Configure autenticação via HTTPS com token ou use SSH:

```bash
# Via SSH (recomendado):
git remote set-url origin git@github.com:seu-usuario/seu-repo.git

# Via HTTPS com token:
git remote set-url origin https://SEU_TOKEN@github.com/seu-usuario/seu-repo.git
```

---

## 🗺️ Roadmap

- [x] Commit + push interativo com Conventional Commits
- [x] `git diff --stat` antes do commit
- [x] Seletor de branch
- [x] `git pull --rebase` antes do push
- [x] Histórico de mensagens de commit
- [x] Escopo opcional no commit
- [x] `ezgit log` — histórico colorido
- [x] `ezgit branch` — gerenciar branches
- [x] `ezgit undo` — desfazer commits
- [x] `ezgit github` — GitHub API (perfil, repos, PR, issues)
- [ ] `ezgit stash` — gerenciar stashes
- [ ] Suporte a tags de versão (`git tag`)
- [ ] Detecção de `.env` fora do `.gitignore`
- [ ] Modo `--dry-run`
- [ ] Temas personalizáveis via `.ezgitrc`
- [ ] Suporte a monorepo / workspaces

---
