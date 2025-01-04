import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

export class Config {
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration('texProjectManager');
  }

  get(key: string): any {
    return this.config.get(key);
  }

  get defaultProjectsPath(): string {
    const projectPath = this.get('defaultProjectsPath');
    return projectPath ? projectPath.replace(/^~/, os.homedir()) : path.join(os.homedir(), 'tex_projects');
  }

  get defaultTemplatesPath(): string {
    const templatesPath = this.get('defaultTemplatesPath');
    return templatesPath ? templatesPath.replace(/^~/, os.homedir()) : path.join(os.homedir(), 'tex_templates');
  }

  get databasePath(): string {
    const databasePath = this.get('databasePath');
    return databasePath ? databasePath.replace(/^~/, os.homedir()) : path.join(os.homedir(), 'tex_projects.json');
  }

  get defaultTemplate(): string {
    return this.get('defaultTemplate') || 'default';
  }
}
