import { execa } from 'execa';

/** Executa um comando git sem lançar exceção */
export async function runGit(...args) {
  return execa('git', args, { reject: false });
}

/** Verifica se a pasta atual é um repositório Git */
export async function isGitRepo() {
  const { exitCode } = await runGit('rev-parse', '--is-inside-work-tree');
  return exitCode === 0;
}

/** Verifica se há alterações (staged ou unstaged) */
export async function hasUncommittedChanges() {
  const { stdout } = await runGit('status', '--porcelain');
  return stdout.trim().length > 0;
}

/** Retorna o nome da branch atual */
export async function getCurrentBranch() {
  const { stdout } = await runGit('rev-parse', '--abbrev-ref', 'HEAD');
  return stdout.trim();
}

/** Verifica se a branch tem upstream configurado */
export async function hasUpstream(branch) {
  const { exitCode } = await runGit('config', '--get', `branch.${branch}.remote`);
  return exitCode === 0;
}

/** Lista todas as branches locais */
export async function listBranches() {
  const { stdout } = await runGit('branch', '--format=%(refname:short)');
  return stdout.trim().split('\n').filter(Boolean);
}

/** Retorna o diff --stat (resumo das mudanças) */
export async function getDiffStat() {
  const { stdout } = await runGit('diff', '--stat', 'HEAD');
  // Inclui também arquivos novos (untracked)
  if (!stdout.trim()) {
    const { stdout: cached } = await runGit('diff', '--cached', '--stat');
    return cached.trim();
  }
  return stdout.trim();
}

/** Retorna os N últimos commits formatados */
export async function getLog(n = 20) {
  const format = '%H|%h|%s|%an|%ar|%d';
  const { stdout } = await runGit('log', `--max-count=${n}`, `--format=${format}`);
  if (!stdout.trim()) return [];

  return stdout.trim().split('\n').map(line => {
    const [hash, shortHash, subject, author, date, refs] = line.split('|');
    return { hash, shortHash, subject, author, date, refs: refs?.trim() || '' };
  });
}

/** Retorna o nome do remote origin */
export async function getRemoteUrl() {
  const { stdout } = await runGit('remote', 'get-url', 'origin');
  return stdout.trim();
}

/** Interpreta erros comuns de git push */
export function parseGitPushError(stderr = '', stdout = '') {
  const msg = (stderr + stdout).toLowerCase();
  if (msg.includes('rejected'))           return 'push_rejected';
  if (msg.includes('could not resolve'))  return 'no_connection';
  if (msg.includes("'origin' does not"))  return 'no_remote';
  if (msg.includes('conflict'))           return 'conflict';
  if (msg.includes('authentication'))     return 'auth_error';
  return 'unknown';
}
