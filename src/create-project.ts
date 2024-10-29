import * as fs from 'fs';
import * as path from 'path';
import * as vscode from "vscode";
import { moveTemplate } from "./templates";


export async function createProject(projectName: string, folderUri: vscode.Uri, templateName: string) {
    if (!projectName) {
        console.log('Project name is not defined');
        return;
    } else if (!folderUri) {
        console.log('Folder URI is not defined');
        return;
    } else if (!templateName) {
        console.log('Template name is not defined');
        return;
    }

    if (!fs.existsSync(folderUri.fsPath)) {
        console.log('Folder does not exist');
        return;
    }

    const fullProjectPath = path.join(folderUri.fsPath, projectName);
    console.log(fullProjectPath)
    if (fs.existsSync(fullProjectPath)) {
        console.log(`Project ${projectName} already exists at ${fullProjectPath}`);
        return;
    }

    fs.mkdirSync(fullProjectPath, { recursive: true });
    moveTemplate(templateName, fullProjectPath);

    if (!fs.existsSync(fullProjectPath)) {
        vscode.window.showInformationMessage(`Project ${projectName} created at ${fullProjectPath}`);
    } else {
        vscode.window.showErrorMessage(`Failed to create project ${projectName} at ${fullProjectPath}`);
    }

    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(fullProjectPath), { forceNewWindow: false });
}