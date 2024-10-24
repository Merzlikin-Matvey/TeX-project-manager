import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';

export function createProject(name: string) {
    const config = vscode.workspace.getConfiguration('texProjectManager');
    let projectPath = config.get<string>('projectPath') || '~/tex_projects';
    projectPath = projectPath.replace('~', os.homedir());
    fs.mkdir(path.join(projectPath, name), { recursive: true }, (err) => {
        if (err) {
            vscode.window.showErrorMessage(`Failed to create project: ${err.message}`);
        } else {
            vscode.window.showInformationMessage(`Project created at: ${path.join(projectPath, name)}`);
        }
    });
}