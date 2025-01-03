import * as vscode from 'vscode';

export function getUserConfig() {
  return vscode.workspace.getConfiguration('texProjectManager');
}

export function getDefaultFolderPath(): string {
  const config = getUserConfig();
  return config.get<string>('defaultProjectPath') || '~/tex_projects';
}

export function getDefaultTemplatesPath(): string {
  const config = getUserConfig();
  return config.get<string>('defaultTemplatesPath') || '~/tex_templates';
}

export function getDefaultTemplate(): string {
  const config = getUserConfig();
  return config.get<string>('defaultTemplate') || 'default';
}

export function getDefaultDatabasePath(): string {
  const config = getUserConfig();
  return config.get<string>('databasePath') || '~/tex_projects.json';
}