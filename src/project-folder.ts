import * as fs from 'fs';
import * as vscode from 'vscode';
import * as os from 'os';

export function isFolderExists(): boolean {
    const config = vscode.workspace.getConfiguration('texProjectManager');
    let projectPath = config.get<string>('projectPath') || '~/tex_projects';
    projectPath = projectPath.replace('~', os.homedir());
    return fs.existsSync(projectPath);
}

export function createFolder() {
    const config = vscode.workspace.getConfiguration('texProjectManager');
    let projectPath = config.get<string>('projectPath') || '~/tex_projects';
    projectPath = projectPath.replace('~', os.homedir());
    fs.mkdir(projectPath, { recursive: true }, (err) => {
        if (err) {
            vscode.window.showErrorMessage(`Failed to create folder: ${err.message}`);
        } else {
            vscode.window.showInformationMessage(`Folder created at: ${projectPath}`);
        }
    });
}