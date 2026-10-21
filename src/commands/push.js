import * as p from '@clack/prompts';
import { c, ICONS, COMMIT_TYPES } from '../utils/style.js';
import {
  runGit, isGitRepo, hasUncommittedChanges, getCurrentBranch,
  hasUpstream, listBranches, getDiffStat, parseGitPushError,
} from '../utils/git.js';
import { getHistory, addToHistory } from '../utils/config.js';

// ─────────────────────────────────────────────────────────────
// 🚀  Comando principal: commit + push interativo
// ─────────────────────────────────────────────────────────────

export async function commandPush() {
  p.intro(c.accent(` ${ICONS.git}  ezgit push — Vamos commitar! `));

  // ── 1. Verificar repositório Git ──────────────────────────
  const isRepo = await isGitRepo();
  if (!isRepo) {
    p.log.warn(c.warning(`${ICONS.warn}  A pasta atual não é um repositório Git.`));

    const action = await p.select({
      message: 'O que você deseja fazer?',
      options: [
        { value: 'init', label: `${c.accent('git init')}  — Inicializar repositório local` },
        { value: 'quit', label: `${c.muted('Sair')}       — Cancelar` },
      ],
    });

    if (p.isCancel(action) || action === 'quit') {
      p.cancel(c.muted('Cancelado. Até mais! 👋'));
      return;
    }

    const s = p.spinner();
    s.start('Inicializando repositório Git...');
    const { exitCode, stderr } = await runGit('init');
    if (exitCode !== 0) {
      s.stop(c.danger(`${ICONS.error}  Falha ao inicializar.`));
      p.log.error(c.danger(stderr));
      process.exit(1);
    }
    s.stop(c.success(`${ICONS.check}  Repositório inicializado!`));
    p.log.info(c.subtle(`\n  ${ICONS.arrow}  Próximo: ${c.accent('git remote add origin <url>')}\n`));
    p.outro(c.accent('Pronto! Rode ezgit novamente para commitar. 🎉'));
    return;
  }

  // ── 2. Checar alterações pendentes ───────────────────────
  const hasPending = await hasUncommittedChanges();
  if (!hasPending) {
    p.log.success(c.success(`${ICONS.check}  Repositório limpo! Nada para commitar.`));
    p.outro(c.muted(`Volte quando tiver novidades! ${ICONS.sparkle}`));
    return;
  }

  // ── 3. Branch atual ou seletor ────────────────────────────
  const currentBranch = await getCurrentBranch();
  const branches = await listBranches();

  let targetBranch = currentBranch;
  if (branches.length > 1) {
    const branchChoice = await p.select({
      message: `${ICONS.branch}  Branch de destino:`,
      options: branches.map(b => ({
        value: b,
        label: b === currentBranch
          ? `${c.accent(b)}  ${c.muted('← atual')}`
          : c.subtle(b),
      })),
    });
    if (p.isCancel(branchChoice)) { p.cancel(c.muted('Cancelado. 👋')); return; }
    targetBranch = branchChoice;

    // Trocar de branch se necessário
    if (targetBranch !== currentBranch) {
      const s = p.spinner();
      s.start(`Trocando para branch ${targetBranch}...`);
      const { exitCode, stderr } = await runGit('checkout', targetBranch);
      if (exitCode !== 0) {
        s.stop(c.danger(`${ICONS.error}  Falha ao trocar de branch.`));
        p.log.error(c.danger(stderr));
        process.exit(1);
      }
      s.stop(c.success(`${ICONS.check}  Branch ${c.accent(targetBranch)} ativa.`));
    }
  } else {
    p.log.info(`  ${ICONS.branch}  Branch: ${c.accent(targetBranch)}`);
  }

  // ── 4. Diff --stat (resumo das mudanças) ─────────────────
  const diffStat = await getDiffStat();
  if (diffStat) {
    console.log('');
    console.log(c.accent(`  ${ICONS.diff}  Resumo das alterações:`));
    diffStat.split('\n').forEach(line => {
      // Colorir linhas com + ou -
      const colored = line
        .replace(/\+/g, c.success('+'))
        .replace(/-(?!-)/g, c.danger('-'));
      console.log(c.muted('  │ ') + c.subtle(colored));
    });
    console.log('');
  }

  // ── 5. git pull com rebase antes de commitar ─────────────
  const upstreamExists = await hasUpstream(targetBranch);
  if (upstreamExists) {
    const doPull = await p.confirm({
      message: `${ICONS.pull}  Fazer ${c.accent('git pull --rebase')} antes de commitar?`,
      initialValue: true,
    });
    if (p.isCancel(doPull)) { p.cancel(c.muted('Cancelado. 👋')); return; }

    if (doPull) {
      const s = p.spinner();
      s.start('Baixando atualizações remotas (rebase)...');
      const { exitCode, stderr, stdout } = await runGit('pull', '--rebase', 'origin', targetBranch);
      if (exitCode !== 0) {
        s.stop(c.danger(`${ICONS.error}  Pull com rebase falhou.`));
        p.log.error(c.danger((stderr || stdout).trim()));
        process.exit(1);
      }
      s.stop(c.success(`${ICONS.check}  Repositório atualizado.`));
    }
  }

  // ── 6. Tipo de commit (Conventional Commits) ─────────────
  const commitType = await p.select({
    message: `${ICONS.commit}  Tipo de alteração:`,
    options: COMMIT_TYPES.map(t => ({
      value: t.value,
      label: `${t.emoji}  ${t.color(t.label.padEnd(9))} ${c.muted('─')} ${c.subtle(t.desc)}`,
    })),
  });
  if (p.isCancel(commitType)) { p.cancel(c.muted('Cancelado. 👋')); return; }

  // ── 7. Scope opcional ─────────────────────────────────────
  const scope = await p.text({
    message: `${ICONS.commit}  Escopo ${c.muted('(opcional)')}:`,
    placeholder: 'ex: auth, api, ui — deixe em branco para ignorar',
  });
  if (p.isCancel(scope)) { p.cancel(c.muted('Cancelado. 👋')); return; }

  // ── 8. Mensagem do commit (com histórico) ─────────────────
  const history = getHistory();
  let commitMsg;

  if (history.length > 0) {
    const msgChoice = await p.select({
      message: `${ICONS.history}  Mensagem do commit:`,
      options: [
        { value: '__new__', label: `${c.accent('✍  Digitar nova mensagem')}` },
        ...history.slice(0, 8).map(m => ({
          value: m,
          label: `${c.muted(ICONS.history)}  ${c.subtle(m)}`,
          hint: 'histórico',
        })),
      ],
    });
    if (p.isCancel(msgChoice)) { p.cancel(c.muted('Cancelado. 👋')); return; }

    if (msgChoice === '__new__') {
      commitMsg = await promptCommitMessage();
    } else {
      commitMsg = msgChoice;
    }
  } else {
    commitMsg = await promptCommitMessage();
  }

  if (!commitMsg || p.isCancel(commitMsg)) { p.cancel(c.muted('Cancelado. 👋')); return; }

  // Montar mensagem final
  const scopePart = scope?.trim() ? `(${scope.trim()})` : '';
  const fullCommitMessage = `${commitType}${scopePart}: ${commitMsg.trim()}`;

  // ── 9. Confirmação final com resumo ──────────────────────
  console.log('');
  p.log.message(
    c.accent.bold(`  📋  Resumo do commit:\n`) +
    `\n  ${c.muted('Mensagem:')}  ${c.accent(fullCommitMessage)}` +
    `\n  ${c.muted('Branch:')}    ${c.accent(targetBranch)}` +
    `\n  ${c.muted('Ações:')}     ${c.muted('git add . → git commit → git push')}\n`
  );

  const confirmed = await p.confirm({
    message: `${ICONS.push}  Confirmar e fazer push agora?`,
    initialValue: true,
  });
  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel(c.muted('Operação cancelada. Nenhum commit realizado.'));
    return;
  }

  // ── 10. Executar: git add . ───────────────────────────────
  const s = p.spinner();

  s.start(c.muted('Adicionando arquivos ao stage...'));
  const addResult = await runGit('add', '.');
  if (addResult.exitCode !== 0) {
    s.stop(c.danger(`${ICONS.error}  Falha no git add .`));
    p.log.error(c.danger(addResult.stderr || 'Erro desconhecido.'));
    process.exit(1);
  }
  s.stop(c.success(`${ICONS.check}  git add .`));

  // ── 11. Executar: git commit ──────────────────────────────
  s.start(c.muted(`Commitando: "${fullCommitMessage}"...`));
  const commitResult = await runGit('commit', '-m', fullCommitMessage);
  if (commitResult.exitCode !== 0) {
    const errMsg = (commitResult.stderr || commitResult.stdout || '').trim();
    s.stop(c.danger(`${ICONS.error}  Falha no commit.`));
    p.log.error(c.danger(errMsg || 'Erro desconhecido.'));
    process.exit(1);
  }
  s.stop(c.success(`${ICONS.check}  git commit -m "${fullCommitMessage}"`));
  addToHistory(commitMsg.trim());  // Salvar no histórico

  // ── 12. Executar: git push ────────────────────────────────
  s.start(c.muted(`Enviando para origin/${targetBranch}...`));
  const upstreamOk = await hasUpstream(targetBranch);
  const pushResult = upstreamOk
    ? await runGit('push', 'origin', targetBranch)
    : await runGit('push', '--set-upstream', 'origin', targetBranch);

  if (pushResult.exitCode !== 0) {
    s.stop(c.danger(`${ICONS.error}  Push falhou.`));
    const errType = parseGitPushError(pushResult.stderr, pushResult.stdout);
    printPushError(errType, targetBranch, pushResult.stderr || pushResult.stdout);
    process.exit(1);
  }
  s.stop(c.success(`${ICONS.check}  git push origin ${targetBranch}`));

  // ── 13. Sucesso! ──────────────────────────────────────────
  console.log('');
  p.outro(
    c.success(`${ICONS.rocket}  Push realizado! `) +
    c.muted('Branch: ') + c.accent(targetBranch) +
    c.muted(' — ') + c.accent(fullCommitMessage)
  );
}

// ── Helpers ────────────────────────────────────────────────────

async function promptCommitMessage() {
  return p.text({
    message: `${ICONS.commit}  Mensagem do commit:`,
    placeholder: 'ex: adiciona autenticação com Google',
    validate(value) {
      const t = value?.trim();
      if (!t || t.length === 0) return 'A mensagem não pode ser vazia.';
      if (t.length < 5)         return 'Mínimo de 5 caracteres.';
      if (t.length > 72)        return `Máximo de 72 caracteres (atual: ${t.length}).`;
    },
  });
}

function printPushError(errType, branch, rawErr) {
  const errors = {
    push_rejected: [
      c.danger('✘  Push rejeitado! Existem commits remotos não baixados.'),
      c.subtle(`   ${ICONS.arrow}  Tente: ${c.accent('git pull origin ' + branch + ' --rebase')}`),
    ],
    no_connection: [
      c.danger('✘  Sem conexão com o servidor remoto.'),
      c.subtle(`   ${ICONS.arrow}  Verifique sua conexão com a internet.`),
    ],
    no_remote: [
      c.danger("✘  Nenhum remote 'origin' configurado."),
      c.subtle(`   ${ICONS.arrow}  Adicione com: ${c.accent('git remote add origin <url>')}`),
    ],
    conflict: [
      c.danger('✘  Conflito detectado.'),
      c.subtle(`   ${ICONS.arrow}  Resolva os conflitos e faça commit novamente.`),
    ],
    auth_error: [
      c.danger('✘  Falha de autenticação.'),
      c.subtle(`   ${ICONS.arrow}  Verifique seu token ou credenciais do Git.`),
    ],
    unknown: [c.danger(rawErr?.trim() || 'Erro desconhecido.')],
  };
  (errors[errType] || errors.unknown).forEach(line => console.log('  ' + line));
  console.log('');
}
