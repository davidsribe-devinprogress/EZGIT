import * as p from '@clack/prompts';
import { c, ICONS } from '../utils/style.js';
import { runGit, getCurrentBranch, listBranches } from '../utils/git.js';

// ─────────────────────────────────────────────────────────────
// 🌿  Comando: ezgit branch — Gerenciar branches
// ─────────────────────────────────────────────────────────────

export async function commandBranch() {
  p.intro(c.accent(` ${ICONS.branch}  ezgit branch — Gerenciar branches `));

  const action = await p.select({
    message: 'O que deseja fazer?',
    options: [
      { value: 'list',   label: `${c.accent('Listar')}   — Ver todas as branches` },
      { value: 'create', label: `${c.success('Criar')}    — Criar nova branch` },
      { value: 'switch', label: `${c.cyan('Trocar')}    — Mudar de branch` },
      { value: 'delete', label: `${c.danger('Deletar')}   — Remover branch local` },
      { value: 'rename', label: `${c.orange('Renomear')}  — Renomear branch atual` },
    ],
  });
  if (p.isCancel(action)) { p.cancel(c.muted('Cancelado. 👋')); return; }

  const currentBranch = await getCurrentBranch();
  const branches      = await listBranches();

  switch (action) {

    // ── Listar ──────────────────────────────────────────────
    case 'list': {
      console.log('');
      console.log(c.accent.bold(`  ${ICONS.branch}  Branches locais:`));
      console.log('');
      branches.forEach(b => {
        const isCurrent = b === currentBranch;
        const marker = isCurrent ? c.success('● ') : c.muted('○ ');
        const name   = isCurrent ? c.accent.bold(b) + c.muted('  ← atual') : c.subtle(b);
        console.log(`    ${marker}${name}`);
      });
      console.log('');
      p.outro(c.muted(`${branches.length} branch(es) encontrada(s).`));
      break;
    }

    // ── Criar ────────────────────────────────────────────────
    case 'create': {
      const newName = await p.text({
        message: `${ICONS.branch}  Nome da nova branch:`,
        placeholder: 'ex: feature/nova-funcionalidade',
        validate(value) {
          const t = value?.trim();
          if (!t)                         return 'O nome não pode ser vazio.';
          if (branches.includes(t))       return 'Já existe uma branch com esse nome.';
          if (/\s/.test(t))               return 'O nome não pode ter espaços.';
          if (!/^[a-zA-Z0-9/_.-]+$/.test(t)) return 'Use apenas letras, números, /, _, - ou .';
        },
      });
      if (p.isCancel(newName)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const switchNow = await p.confirm({
        message: `Trocar para ${c.accent(newName.trim())} após criar?`,
        initialValue: true,
      });
      if (p.isCancel(switchNow)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const s = p.spinner();
      s.start(`Criando branch ${newName.trim()}...`);

      const flag = switchNow ? '-b' : '--track';
      const cmd  = switchNow
        ? ['checkout', '-b', newName.trim()]
        : ['branch', newName.trim()];
      const { exitCode, stderr } = await runGit(...cmd);

      if (exitCode !== 0) {
        s.stop(c.danger(`${ICONS.error}  Falha ao criar branch.`));
        p.log.error(c.danger(stderr));
        process.exit(1);
      }
      s.stop(c.success(`${ICONS.check}  Branch ${c.accent(newName.trim())} criada${switchNow ? ' e ativa' : ''}!`));
      p.outro(c.muted('Pronto!'));
      break;
    }

    // ── Trocar ───────────────────────────────────────────────
    case 'switch': {
      const others = branches.filter(b => b !== currentBranch);
      if (others.length === 0) {
        p.log.warn(c.warning('Você só tem uma branch. Crie mais antes de trocar.'));
        p.outro(c.muted('Nada a fazer.'));
        return;
      }

      const target = await p.select({
        message: `${ICONS.branch}  Trocar para qual branch?`,
        options: others.map(b => ({ value: b, label: c.subtle(b) })),
      });
      if (p.isCancel(target)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const s = p.spinner();
      s.start(`Trocando para ${target}...`);
      const { exitCode, stderr } = await runGit('checkout', target);
      if (exitCode !== 0) {
        s.stop(c.danger(`${ICONS.error}  Falha ao trocar de branch.`));
        p.log.error(c.danger(stderr));
        process.exit(1);
      }
      s.stop(c.success(`${ICONS.check}  Agora em: ${c.accent(target)}`));
      p.outro(c.muted('Pronto!'));
      break;
    }

    // ── Deletar ──────────────────────────────────────────────
    case 'delete': {
      const others = branches.filter(b => b !== currentBranch);
      if (others.length === 0) {
        p.log.warn(c.warning('Não é possível deletar a branch atual.'));
        p.outro(c.muted('Troque de branch primeiro.'));
        return;
      }

      const toDelete = await p.select({
        message: `${ICONS.branch}  Qual branch deletar?`,
        options: others.map(b => ({ value: b, label: c.danger(b) })),
      });
      if (p.isCancel(toDelete)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const confirm = await p.confirm({
        message: c.danger(`Deletar branch "${toDelete}"? Isso não pode ser desfeito.`),
        initialValue: false,
      });
      if (p.isCancel(confirm) || !confirm) { p.cancel(c.muted('Operação cancelada.')); return; }

      const s = p.spinner();
      s.start(`Deletando ${toDelete}...`);
      const { exitCode, stderr } = await runGit('branch', '-D', toDelete);
      if (exitCode !== 0) {
        s.stop(c.danger(`${ICONS.error}  Falha ao deletar.`));
        p.log.error(c.danger(stderr));
        process.exit(1);
      }
      s.stop(c.success(`${ICONS.check}  Branch ${c.danger(toDelete)} deletada.`));
      p.outro(c.muted('Pronto!'));
      break;
    }

    // ── Renomear ─────────────────────────────────────────────
    case 'rename': {
      p.log.info(`  Branch atual: ${c.accent(currentBranch)}`);
      const newName = await p.text({
        message: `${ICONS.branch}  Novo nome para a branch:`,
        placeholder: 'ex: feature/minha-nova-branch',
        validate(value) {
          const t = value?.trim();
          if (!t)               return 'O nome não pode ser vazio.';
          if (t === currentBranch) return 'O nome é igual ao atual.';
          if (/\s/.test(t))     return 'O nome não pode ter espaços.';
        },
      });
      if (p.isCancel(newName)) { p.cancel(c.muted('Cancelado. 👋')); return; }

      const s = p.spinner();
      s.start(`Renomeando para ${newName.trim()}...`);
      const { exitCode, stderr } = await runGit('branch', '-m', newName.trim());
      if (exitCode !== 0) {
        s.stop(c.danger(`${ICONS.error}  Falha ao renomear.`));
        p.log.error(c.danger(stderr));
        process.exit(1);
      }
      s.stop(c.success(`${ICONS.check}  Branch renomeada para ${c.accent(newName.trim())}`));
      p.outro(c.muted('Pronto!'));
      break;
    }
  }
}
