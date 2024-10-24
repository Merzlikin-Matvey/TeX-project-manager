import * as vscode from 'vscode';
import { createFolder, isFolderExists } from './project-folder';
import { createProject } from './create-project';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "tex-project-manager" is now active!');

	const disposable = vscode.commands.registerCommand('tex-project-manager.createProject', async () => {
		const projectName = await vscode.window.showInputBox({
			prompt: 'Enter the name of the folder to create on the Desktop'
		});

		if (projectName) {
			if (!isFolderExists()) {
				createFolder();
			}

			const projectFolderPath = createProject(projectName);
			vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectFolderPath), { forceReuseWindow: true });
		} else {
			vscode.window.showErrorMessage('No folder name provided');
			console.error('No folder name provided');
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}