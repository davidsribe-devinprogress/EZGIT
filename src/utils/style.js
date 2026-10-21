import chalk from 'chalk';

export const c = {
  brand:   chalk.bold.hex('#F7768E'),
  accent:  chalk.hex('#7AA2F7'),
  success: chalk.bold.hex('#9ECE6A'),
  warning: chalk.bold.hex('#E0AF68'),
  danger:  chalk.bold.hex('#F7768E'),
  muted:   chalk.hex('#565F89'),
  subtle:  chalk.hex('#A9B1D6'),
  purple:  chalk.hex('#BB9AF7'),
  cyan:    chalk.hex('#7DCFFF'),
  orange:  chalk.hex('#FF9E64'),
  yellow:  chalk.hex('#E0AF68'),
  dim:     chalk.dim,
};

export const ICONS = {
  git:     '󰊢',
  branch:  '',
  commit:  '󰜘',
  push:    '󰶻',
  pull:    '󰶽',
  check:   '✔',
  warn:    '⚠',
  error:   '✘',
  rocket:  '🚀',
  sparkle: '✨',
  arrow:   '›',
  log:     '󰋚',
  tag:     '󰓹',
  github:  '',
  stash:   '󱊈',
  undo:    '↩',
  diff:    '󰦒',
  history: '󰋚',
  key:     '🔑',
  globe:   '🌐',
  pr:      '',
  issue:   '',
  repo:    '󱉢',
};

export const COMMIT_TYPES = [
  { value: 'feat',     emoji: '✨', color: c.accent,   label: 'feat',     desc: 'Uma nova funcionalidade' },
  { value: 'fix',      emoji: '🐛', color: c.success,  label: 'fix',      desc: 'Correção de um bug' },
  { value: 'docs',     emoji: '📝', color: c.cyan,     label: 'docs',     desc: 'Mudanças na documentação' },
  { value: 'refactor', emoji: '♻️', color: c.purple,   label: 'refactor', desc: 'Refatoração de código' },
  { value: 'style',    emoji: '💅', color: c.orange,   label: 'style',    desc: 'Formatação, espaços, ponto e vírgula' },
  { value: 'test',     emoji: '🧪', color: c.yellow,   label: 'test',     desc: 'Adicionar ou corrigir testes' },
  { value: 'chore',    emoji: '🔧', color: c.muted,    label: 'chore',    desc: 'Tarefas de manutenção / build' },
  { value: 'perf',     emoji: '⚡', color: c.warning,  label: 'perf',     desc: 'Melhoria de performance' },
  { value: 'ci',       emoji: '🤖', color: c.subtle,   label: 'ci',       desc: 'Mudanças em CI/CD' },
];

export function printBanner() {
  console.log('');
  console.log(c.brand(`  ███████╗███████╗ ██████╗ ██╗████████╗`));
  console.log(c.brand(`  ██╔════╝╚══███╔╝██╔════╝ ██║╚══██╔══╝`));
  console.log(c.brand(`  █████╗    ███╔╝ ██║  ███╗██║   ██║   `));
  console.log(c.brand(`  ██╔══╝   ███╔╝  ██║   ██║██║   ██║   `));
  console.log(c.brand(`  ███████╗███████╗╚██████╔╝██║   ██║   `));
  console.log(c.brand(`  ╚══════╝╚══════╝ ╚═════╝ ╚═╝   ╚═╝   `));
  console.log('');
  console.log(c.accent(`  ${ICONS.rocket}  Automação Git interativa — v2.0.0`));
  console.log(c.muted(`  Ctrl+C para cancelar a qualquer momento.\n`));
}

export function printHelp() {
  console.log('');
  console.log(c.brand('  ezgit') + c.muted(' — CLI interativa para Git & GitHub\n'));
  console.log(c.accent('  Uso:'));
  console.log(`    ${c.brand('ezgit')}              ${c.muted('→')} Fluxo de commit + push interativo`);
  console.log(`    ${c.brand('ezgit log')}          ${c.muted('→')} Histórico de commits colorido`);
  console.log(`    ${c.brand('ezgit branch')}       ${c.muted('→')} Gerenciar branches`);
  console.log(`    ${c.brand('ezgit undo')}         ${c.muted('→')} Desfazer o último commit`);
  console.log(`    ${c.brand('ezgit github')}       ${c.muted('→')} Integração com GitHub (API)`);
  console.log(`    ${c.brand('ezgit --help')}       ${c.muted('→')} Exibe esta ajuda`);
  console.log('');
}
