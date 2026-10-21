import * as p from '@clack/prompts';
import { c, ICONS } from '../utils/style.js';
import { getLog } from '../utils/git.js';

// ─────────────────────────────────────────────────────────────
// 📋  Comando: ezgit log — Histórico de commits colorido
// ─────────────────────────────────────────────────────────────

const TYPE_COLORS = {
  feat:     { color: c.accent,   emoji: '✨' },
  fix:      { color: c.success,  emoji: '🐛' },
  docs:     { color: c.cyan,     emoji: '📝' },
  refactor: { color: c.purple,   emoji: '♻️' },
  style:    { color: c.orange,   emoji: '💅' },
  test:     { color: c.yellow,   emoji: '🧪' },
  chore:    { color: c.muted,    emoji: '🔧' },
  perf:     { color: c.warning,  emoji: '⚡' },
  ci:       { color: c.subtle,   emoji: '🤖' },
};

function colorizeSubject(subject) {
  const match = subject.match(/^(\w+)(\(.+?\))?(!?): (.+)$/);
  if (!match) return c.subtle(subject);

  const [, type, scope, bang, message] = match;
  const typeStyle = TYPE_COLORS[type] || { color: c.muted, emoji: '•' };

  const coloredType  = typeStyle.color.bold(type);
  const coloredScope = scope ? c.dim(scope) : '';
  const coloredBang  = bang ? c.danger(bang) : '';
  const coloredColon = c.muted(':');
  const coloredMsg   = c.subtle(` ${message}`);

  return `${typeStyle.emoji}  ${coloredType}${coloredScope}${coloredBang}${coloredColon}${coloredMsg}`;
}

function colorizeRefs(refs) {
  if (!refs) return '';
  return refs
    .replace(/HEAD -> ([^,)]+)/g, (_, br) => c.success.bold(`HEAD → ${br}`))
    .replace(/origin\/([^,)]+)/g, (_, br) => c.accent(`origin/${br}`))
    .replace(/tag: ([^,)]+)/g,    (_, t)  => c.yellow(`🏷  ${t}`));
}

export async function commandLog() {
  p.intro(c.accent(` ${ICONS.log}  ezgit log — Histórico de commits `));

  const nOption = await p.select({
    message: 'Quantos commits deseja ver?',
    options: [
      { value: 10,  label: c.subtle('Últimos 10') },
      { value: 20,  label: c.subtle('Últimos 20') },
      { value: 50,  label: c.subtle('Últimos 50') },
      { value: 100, label: c.subtle('Últimos 100') },
    ],
  });
  if (p.isCancel(nOption)) { p.cancel(c.muted('Cancelado. 👋')); return; }

  const commits = await getLog(nOption);

  if (commits.length === 0) {
    p.log.warn(c.warning('Nenhum commit encontrado neste repositório.'));
    p.outro(c.muted('Faça seu primeiro commit com: ezgit'));
    return;
  }

  console.log('');
  console.log(c.accent.bold(`  ${'Hash'.padEnd(8)}  ${'Autor'.padEnd(16)}  ${'Quando'.padEnd(14)}  Mensagem`));
  console.log(c.muted(`  ${'─'.repeat(8)}  ${'─'.repeat(16)}  ${'─'.repeat(14)}  ${'─'.repeat(40)}`));

  commits.forEach((commit, i) => {
    const isFirst = i === 0;
    const hash    = isFirst ? c.success.bold(commit.shortHash) : c.muted(commit.shortHash);
    const author  = c.cyan(commit.author.slice(0, 16).padEnd(16));
    const date    = c.muted(commit.date.slice(0, 14).padEnd(14));
    const subject = colorizeSubject(commit.subject);
    const refs    = commit.refs ? `  ${c.muted('(')}${colorizeRefs(commit.refs)}${c.muted(')')}` : '';

    console.log(`  ${hash}  ${author}  ${date}  ${subject}${refs}`);
  });

  console.log('');
  p.outro(c.muted(`${commits.length} commits exibidos.`));
}
