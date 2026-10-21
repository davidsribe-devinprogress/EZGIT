import * as p from '@clack/prompts';
import { c, ICONS } from '../utils/style.js';
import { runGit, getCurrentBranch } from '../utils/git.js';

// ─────────────────────────────────────────────────────────────
// ↩️   Comando: ezgit undo — Desfazer último commit
// ─────────────────────────────────────────────────────────────

export async function commandUndo() {
  p.intro(c.accent(` ${ICONS.undo}  ezgit undo — Desfazer commits `));

  // Mostrar o último commit antes de qualquer ação
  const { stdout: lastCommit } = await runGit('log', '-1', '--oneline');
  if (!lastCommit.trim()) {
    p.log.warn(c.warning('Nenhum commit encontrado para desfazer.'));
    p.outro(c.muted('Nada a fazer.'));
    return;
  }

  p.log.info(`  ${ICONS.commit}  Último commit: ${c.accent(lastCommit.trim())}`);
  console.log('');

  const mode = await p.select({
    message: 'Como deseja desfazer?',
    options: [
      {
        value: 'soft',
        label: `${c.accent('Soft')}  — Desfaz o commit, mantém arquivos ${c.muted('no stage')}`,
        hint: 'mais seguro',
      },
      {
        value: 'mixed',
        label: `${c.warning('Mixed')} — Desfaz o commit, mantém arquivos ${c.muted('fora do stage')}`,
        hint: 'padrão do Git',
      },
      {
        value: 'hard',
        label: `${c.danger('Hard')}  — Desfaz o commit ${c.danger.bold('e perde todas as mudanças')}`,
        hint: '⚠ irreversível',
      },
    ],
  });
  if (p.isCancel(mode)) { p.cancel(c.muted('Cancelado. 👋')); return; }

  // Aviso extra para modo hard
  if (mode === 'hard') {
    const sure = await p.confirm({
      message: c.danger.bold(`⚠  Modo HARD vai APAGAR todas as mudanças. Tem certeza?`),
      initialValue: false,
    });
    if (p.isCancel(sure) || !sure) {
      p.cancel(c.muted('Operação cancelada. Seus arquivos estão seguros.'));
      return;
    }
  }

  const s = p.spinner();
  s.start(`Desfazendo commit (--${mode})...`);
  const { exitCode, stderr } = await runGit('reset', `--${mode}`, 'HEAD~1');

  if (exitCode !== 0) {
    s.stop(c.danger(`${ICONS.error}  Falha ao desfazer commit.`));
    p.log.error(c.danger(stderr || 'Erro desconhecido.'));
    process.exit(1);
  }

  const modeMessages = {
    soft:  'Commit desfeito! Arquivos ainda no stage prontos para re-commitar.',
    mixed: 'Commit desfeito! Arquivos estão fora do stage.',
    hard:  'Commit desfeito e mudanças removidas.',
  };

  s.stop(c.success(`${ICONS.check}  ${modeMessages[mode]}`));
  p.outro(c.muted('Pronto!'));
}
