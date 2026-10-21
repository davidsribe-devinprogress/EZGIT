import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_PATH = join(homedir(), '.ezgitrc');
const MAX_HISTORY = 20;

/** Lê o arquivo de configuração ~/.ezgitrc */
function readConfig() {
  if (!existsSync(CONFIG_PATH)) return { history: [], githubToken: null };
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return { history: [], githubToken: null };
  }
}

/** Salva o arquivo de configuração */
function saveConfig(data) {
  writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/** Retorna o histórico de mensagens de commit */
export function getHistory() {
  return readConfig().history || [];
}

/** Adiciona uma mensagem ao histórico (sem duplicatas) */
export function addToHistory(message) {
  const config = readConfig();
  const history = [message, ...(config.history || []).filter(m => m !== message)];
  config.history = history.slice(0, MAX_HISTORY);
  saveConfig(config);
}

/** Retorna o token do GitHub */
export function getGithubToken() {
  return readConfig().githubToken || null;
}

/** Salva o token do GitHub */
export function saveGithubToken(token) {
  const config = readConfig();
  config.githubToken = token;
  saveConfig(config);
}

/** Retorna o caminho do arquivo de configuração */
export function getConfigPath() {
  return CONFIG_PATH;
}
