#!/usr/bin/env node

/**
 * ezgit v2.0.0 — CLI interativa para automatizar seu fluxo Git & GitHub
 * ─────────────────────────────────────────────────────────────────────
 * Comandos:
 *   ezgit              → Commit + push interativo
 *   ezgit log          → Histórico de commits colorido
 *   ezgit branch       → Gerenciar branches
 *   ezgit undo         → Desfazer último commit
 *   ezgit github       → Integração com GitHub API
 *   ezgit --help       → Ajuda
 */

import { printBanner, printHelp } from './src/utils/style.js';
import { commandPush }   from './src/commands/push.js';
import { commandLog }    from './src/commands/log.js';
import { commandBranch } from './src/commands/branch.js';
import { commandUndo }   from './src/commands/undo.js';
import { commandGithub } from './src/commands/github.js';

const [,, subcommand] = process.argv;

printBanner();

switch (subcommand) {
  case 'log':
    await commandLog();
    break;

  case 'branch':
    await commandBranch();
    break;

  case 'undo':
    await commandUndo();
    break;

  case 'github':
  case 'gh':
    await commandGithub();
    break;

  case '--help':
  case '-h':
  case 'help':
    printHelp();
    break;

  case undefined:
  case 'push':
    await commandPush();
    break;

  default:
    console.error(`\n  ✘  Comando desconhecido: "${subcommand}"\n`);
    printHelp();
    process.exit(1);
}
