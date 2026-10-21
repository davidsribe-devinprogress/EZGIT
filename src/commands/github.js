import * as p from '@clack/prompts';
import { c, ICONS } from '../utils/style.js';
import { getGithubToken, saveGithubToken, getConfigPath } from '../utils/config.js';
import { getCurrentBranch, getRemoteUrl } from '../utils/git.js';

// ─────────────────────────────────────────────────────────────
// 🌐  Comando: ezgit github — Integração com GitHub API
// ─────────────────────────────────────────────────────────────
//
//  ⚙️  STUB — A API oficial do GitHub será adicionada em breve.
//  Os menus e a estrutura já estão prontos. Para ativar:
//    1. Execute: ezgit github → Configurar Token
//    2. Adicione seu Personal Access Token (classic) do GitHub
//    3. Substitua as funções callGitHub() com a lógica real
//
// ─────────────────────────────────────────────────────────────

const GITHUB_API = 'https://api.github.com';

/** Faz uma requisição autenticada à GitHub API */
async function callGitHub(path, options = {}) {
  const token = getGithubToken();
  if (!token) throw new Error('Token do GitHub não configurado. Use "ezgit github" → Configurar Token.');

  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(`GitHub API: ${msg}`);
  }
  return data;
}

/** Extrai owner/repo do remote URL */
function parseRemoteUrl(remoteUrl) {
  if (!remoteUrl) return null;
  const match = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

// ── Menu principal ────────────────────────────────────────────

export async function commandGithub() {
  p.intro(c.accent(` ${ICONS.github}  ezgit github — GitHub API `));

  const token = getGithubToken();
  const tokenStatus = token
    ? c.success(`${ICONS.check}  Token configurado (${token.slice(0, 8)}...)`)
    : c.warning(`${ICONS.warn}  Token não configurado`);

  p.log.info(`  ${ICONS.key}  Status: ${tokenStatus}`);
  console.log('');

  const action = await p.select({
    message: 'O que deseja fazer?',
    options: [
      { value: 'token',   label: `${c.accent(ICONS.key + '  Configurar Token')}       — Salvar seu Personal Access Token` },
      { value: 'whoami',  label: `${c.cyan('👤  Meu Perfil')}              — Ver dados da sua conta GitHub` },
      { value: 'repos',   label: `${c.purple(ICONS.repo + '  Meus Repositórios')}   — Listar seus repos no GitHub` },
      { value: 'create',  label: `${c.success('➕  Criar Repositório')}      — Criar novo repo no GitHub` },
      { value: 'pr',      label: `${c.orange(ICONS.pr + '  Criar Pull Request')}   — Abrir PR para este repositório` },
      { value: 'issues',  label: `${c.yellow(ICONS.issue + '  Listar Issues')}       — Ver issues abertas do repo atual` },
    ],
  });
  if (p.isCancel(action)) { p.cancel(c.muted('Cancelado. 👋')); return; }

  switch (action) {

    // ── Configurar token ─────────────────────────────────────
    case 'token': {
      console.log('');
      p.log.message(
        c.accent.bold(`  ${ICONS.key}  Como obter seu token:\n`) +
        `\n  ${c.muted('1.')} Acesse: ${c.accent('https://github.com/settings/tokens/new')}` +
        `\n  ${c.muted('2.')} Selecione os escopos: ${c.cyan('repo, workflow, read:user')}` +
        `\n  ${c.muted('3.')} Copie o token gerado e cole abaixo.\n` +
        `\n  ${c.muted('Arquivo de configuração:')} ${c.subtle(getConfigPath())}\n`
      );

      const newToken = await p.password({
        message: `${ICONS.key}  Cole seu GitHub Personal Access Token:`,
        validate(value) {
          if (!value?.trim()) return 'O token não pode ser vazio.';
          if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
            return 'Token inválido. Deve começar com "ghp_" ou "github_pat_".';
          }
          if (value.trim().length < 20) return 'Token muito curto.';
        },
      });
      if (p.isCancel(newToken)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const s = p.spinner();
      s.start('Validando token com a GitHub API...');
      try {
        const user = await callGitHub('/user', { method: 'GET', headers: { Authorization: `Bearer ${newToken.trim()}` } });
        saveGithubToken(newToken.trim());
        s.stop(c.success(`${ICONS.check}  Token válido! Olá, ${c.accent('@' + user.login)} 👋`));
        p.outro(c.muted(`Token salvo em ${getConfigPath()}`));
      } catch (err) {
        s.stop(c.danger(`${ICONS.error}  Token inválido ou sem permissões.`));
        p.log.error(c.danger(err.message));
        process.exit(1);
      }
      break;
    }

    // ── Meu perfil ───────────────────────────────────────────
    case 'whoami': {
      const s = p.spinner();
      s.start('Consultando perfil...');
      try {
        const user = await callGitHub('/user');
        s.stop(c.success(`${ICONS.check}  Perfil carregado!`));
        console.log('');
        console.log(c.accent.bold(`  👤  ${user.name || user.login}`));
        console.log(`  ${c.muted('Login:')}       ${c.subtle('@' + user.login)}`);
        console.log(`  ${c.muted('Bio:')}         ${c.subtle(user.bio || '—')}`);
        console.log(`  ${c.muted('Repos:')}       ${c.cyan(user.public_repos)} públicos`);
        console.log(`  ${c.muted('Seguidores:')}  ${c.cyan(user.followers)}`);
        console.log(`  ${c.muted('URL:')}         ${c.accent(user.html_url)}`);
        console.log('');
        p.outro(c.muted('Dados do GitHub carregados com sucesso!'));
      } catch (err) {
        s.stop(c.danger(`${ICONS.error}  Falha ao carregar perfil.`));
        p.log.error(c.danger(err.message));
        process.exit(1);
      }
      break;
    }

    // ── Listar repositórios ───────────────────────────────────
    case 'repos': {
      const s = p.spinner();
      s.start('Carregando seus repositórios...');
      try {
        const repos = await callGitHub('/user/repos?sort=updated&per_page=20');
        s.stop(c.success(`${ICONS.check}  ${repos.length} repositórios encontrados.`));
        console.log('');
        repos.forEach(repo => {
          const priv = repo.private ? c.warning('🔒 ') : c.muted('🌐 ');
          const lang = repo.language ? c.cyan(`[${repo.language}]`) : '';
          const stars = repo.stargazers_count > 0 ? c.yellow(` ⭐ ${repo.stargazers_count}`) : '';
          console.log(`  ${priv}${c.accent(repo.full_name)}  ${lang}${stars}`);
          if (repo.description) {
            console.log(`     ${c.muted(repo.description)}`);
          }
        });
        console.log('');
        p.outro(c.muted('Use o nome acima para referenciar o repositório.'));
      } catch (err) {
        s.stop(c.danger(`${ICONS.error}  Falha ao listar repositórios.`));
        p.log.error(c.danger(err.message));
        process.exit(1);
      }
      break;
    }

    // ── Criar repositório ─────────────────────────────────────
    case 'create': {
      const repoName = await p.text({
        message: `${ICONS.repo}  Nome do repositório:`,
        placeholder: 'ex: meu-projeto-incrivel',
        validate(v) {
          if (!v?.trim()) return 'O nome não pode ser vazio.';
          if (/\s/.test(v)) return 'O nome não pode ter espaços.';
        },
      });
      if (p.isCancel(repoName)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const description = await p.text({
        message: `${ICONS.repo}  Descrição ${c.muted('(opcional):')}`,
        placeholder: 'Uma breve descrição do projeto',
      });
      if (p.isCancel(description)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const isPrivate = await p.confirm({
        message: `${ICONS.key}  Repositório privado?`,
        initialValue: false,
      });
      if (p.isCancel(isPrivate)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const addRemote = await p.confirm({
        message: `${ICONS.git}  Adicionar como remote 'origin' deste projeto?`,
        initialValue: true,
      });
      if (p.isCancel(addRemote)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const s = p.spinner();
      s.start('Criando repositório no GitHub...');
      try {
        const repo = await callGitHub('/user/repos', {
          method: 'POST',
          body: JSON.stringify({
            name: repoName.trim(),
            description: description?.trim() || '',
            private: isPrivate,
            auto_init: false,
          }),
        });
        s.stop(c.success(`${ICONS.check}  Repositório criado: ${c.accent(repo.full_name)}`));
        p.log.info(`  ${ICONS.globe}  URL: ${c.accent(repo.html_url)}`);

        if (addRemote) {
          const { exitCode } = await (await import('../utils/git.js')).runGit(
            'remote', 'add', 'origin', repo.ssh_url
          );
          if (exitCode === 0) {
            p.log.success(c.success(`${ICONS.check}  Remote 'origin' configurado: ${repo.ssh_url}`));
          }
        }
        p.outro(c.muted('Repositório pronto! Use ezgit para fazer seu primeiro push. 🚀'));
      } catch (err) {
        s.stop(c.danger(`${ICONS.error}  Falha ao criar repositório.`));
        p.log.error(c.danger(err.message));
        process.exit(1);
      }
      break;
    }

    // ── Criar Pull Request ────────────────────────────────────
    case 'pr': {
      const remoteUrl = await getRemoteUrl().catch(() => '');
      const parsed = parseRemoteUrl(remoteUrl);

      if (!parsed) {
        p.log.error(c.danger(`${ICONS.error}  Não foi possível detectar o repositório GitHub a partir do remote origin.`));
        p.log.info(c.subtle(`  Remote atual: ${remoteUrl || 'não configurado'}`));
        process.exit(1);
      }

      const currentBranch = await getCurrentBranch();
      p.log.info(`  ${ICONS.branch}  Branch atual: ${c.accent(currentBranch)}`);
      p.log.info(`  ${ICONS.repo}  Repositório: ${c.accent(`${parsed.owner}/${parsed.repo}`)}`);
      console.log('');

      const title = await p.text({
        message: `${ICONS.pr}  Título do Pull Request:`,
        placeholder: 'ex: feat: adiciona autenticação com Google',
        validate(v) {
          if (!v?.trim()) return 'O título não pode ser vazio.';
        },
      });
      if (p.isCancel(title)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const body = await p.text({
        message: `${ICONS.pr}  Descrição ${c.muted('(opcional):')}`,
        placeholder: 'Descreva as mudanças deste PR...',
      });
      if (p.isCancel(body)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const base = await p.text({
        message: `${ICONS.branch}  Branch base (destino):`,
        placeholder: 'main',
        initialValue: 'main',
        validate(v) { if (!v?.trim()) return 'Informe a branch base.'; },
      });
      if (p.isCancel(base)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const isDraft = await p.confirm({
        message: `${ICONS.pr}  Criar como rascunho (draft)?`,
        initialValue: false,
      });
      if (p.isCancel(isDraft)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const s = p.spinner();
      s.start('Criando Pull Request...');
      try {
        const pr = await callGitHub(`/repos/${parsed.owner}/${parsed.repo}/pulls`, {
          method: 'POST',
          body: JSON.stringify({
            title: title.trim(),
            body: body?.trim() || '',
            head: currentBranch,
            base: base.trim(),
            draft: isDraft,
          }),
        });
        s.stop(c.success(`${ICONS.check}  Pull Request criado: #${pr.number}`));
        console.log('');
        console.log(`  ${c.muted('Título:')}  ${c.accent(pr.title)}`);
        console.log(`  ${c.muted('URL:')}     ${c.accent(pr.html_url)}`);
        console.log(`  ${c.muted('Status:')}  ${pr.draft ? c.muted('Draft') : c.success('Pronto para revisão')}`);
        console.log('');
        p.outro(c.muted('PR criado com sucesso! 🎉'));
      } catch (err) {
        s.stop(c.danger(`${ICONS.error}  Falha ao criar PR.`));
        p.log.error(c.danger(err.message));
        process.exit(1);
      }
      break;
    }

    // ── Listar Issues ─────────────────────────────────────────
    case 'issues': {
      const remoteUrl = await getRemoteUrl().catch(() => '');
      const parsed = parseRemoteUrl(remoteUrl);

      if (!parsed) {
        p.log.error(c.danger(`${ICONS.error}  Repositório GitHub não detectado no remote origin.`));
        process.exit(1);
      }

      const s = p.spinner();
      s.start(`Carregando issues de ${parsed.owner}/${parsed.repo}...`);
      try {
        const issues = await callGitHub(
          `/repos/${parsed.owner}/${parsed.repo}/issues?state=open&per_page=20&sort=updated`
        );
        // Filtrar PRs (a API retorna ambos)
        const realIssues = issues.filter(i => !i.pull_request);
        s.stop(c.success(`${ICONS.check}  ${realIssues.length} issue(s) aberta(s).`));

        if (realIssues.length === 0) {
          p.log.success(c.success('Nenhuma issue aberta. Repositório tranquilo! 🎉'));
        } else {
          console.log('');
          realIssues.forEach(issue => {
            const num    = c.muted(`#${String(issue.number).padStart(4, '0')}`);
            const labels = issue.labels.map(l => c.cyan(`[${l.name}]`)).join(' ');
            console.log(`  ${num}  ${c.accent(issue.title)}  ${labels}`);
            console.log(`         ${c.muted(issue.user.login + ' • ' + new Date(issue.updated_at).toLocaleDateString('pt-BR'))}`);
          });
          console.log('');
        }
        p.outro(c.muted(`Veja em: https://github.com/${parsed.owner}/${parsed.repo}/issues`));
      } catch (err) {
        s.stop(c.danger(`${ICONS.error}  Falha ao carregar issues.`));
        p.log.error(c.danger(err.message));
        process.exit(1);
      }
      break;
    }
  }
}
