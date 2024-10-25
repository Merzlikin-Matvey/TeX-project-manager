import * as vscode from 'vscode';
import { createProject, isFolderExists, getFullProjectPath } from './create-project';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "tex-project-manager" is now active!');

	const disposable = vscode.commands.registerCommand('tex-project-manager.createProject', async () => {
		const config = vscode.workspace.getConfiguration('texProjectManager');
		let defaultFolderPath = config.get<string>('projectPath') || '~/tex_projects';
		defaultFolderPath = defaultFolderPath.replace('~', os.homedir());

		const namePick = { label: '$(pencil) Enter Project Name', description: 'Type the name of the new project' };
		const folderPick = { label: '$(file-directory) Select Folder', description: `Default folder: ${defaultFolderPath}` };
		const createProjectPick = { label: 'Create project' };

		let folderUri: vscode.Uri | undefined = vscode.Uri.file(defaultFolderPath);
		let projectName: string | undefined;


		while (true) {
			let selected;
			if (projectName) {
				selected = await vscode.window.showQuickPick([createProjectPick, namePick, folderPick], {
					placeHolder: 'Select an option',
					ignoreFocusOut: true
				});
			} else {
				selected = await vscode.window.showQuickPick([namePick, folderPick], {
					placeHolder: 'Select an option',
					ignoreFocusOut: true
				});
			}

			if (selected == createProjectPick) {
				if (projectName && folderUri) {
					const fullProjectPath = getFullProjectPath(projectName, folderUri.fsPath);
					if (isFolderExists(fullProjectPath)) {
						vscode.window.showErrorMessage(`Project ${projectName} already exists at ${fullProjectPath}`);
						console.error(`Project ${projectName} already exists at ${fullProjectPath}`);
						break;
					}
					createProject(fullProjectPath);
					if (isFolderExists(fullProjectPath)) {
						vscode.window.showInformationMessage(`Project ${projectName} created at ${fullProjectPath}`);
						await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(fullProjectPath), { forceNewWindow: false });
					} else {
						vscode.window.showErrorMessage(`Failed to create project ${projectName}`);
						console.error(`Failed to create project ${projectName}`);
					}
					break;
				}
			} else if (selected === folderPick) {
				const selectedFolderUri = await vscode.window.showOpenDialog({
					canSelectFolders: true,
					canSelectFiles: false,
					canSelectMany: false,
					openLabel: 'Select Folder'
				});

				if (selectedFolderUri && selectedFolderUri[0]) {
					folderUri = selectedFolderUri[0];
					folderPick.description = `Selected folder: ${folderUri.fsPath}`;
					vscode.window.showInformationMessage(`Selected folder: ${folderUri.fsPath}`);
				} else {
					vscode.window.showErrorMessage('No folder selected');
					console.error('No folder selected');
				}
			} else if (selected === namePick) {
				projectName = await vscode.window.showInputBox({
					prompt: 'Enter the name of the project',
					placeHolder: 'Project Name',
					ignoreFocusOut: true
				});

				if (projectName) {
					namePick.description = `Project name: ${projectName}`;
					vscode.window.showInformationMessage(`Project name: ${projectName}`);
				} else {
					vscode.window.showErrorMessage('No project name provided');
					console.error('No project name provided');
				}
			} else {
				vscode.window.showErrorMessage('No option selected');
				console.error('No option selected');
				break;
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}