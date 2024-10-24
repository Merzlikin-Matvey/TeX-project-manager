import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';

export function createProject(name: string): string {
    const config = vscode.workspace.getConfiguration('texProjectManager');
    let projectPath = config.get<string>('projectPath') || '~/tex_projects';
    projectPath = projectPath.replace('~', os.homedir());
    const projectFolderPath = path.join(projectPath, name);
    fs.mkdirSync(projectFolderPath, { recursive: true });
    return projectFolderPath;
}