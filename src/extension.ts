import * as vscode from 'vscode';
import {createDatabase} from "./database";
import {handleCreateProjectCommand} from "./handlers/create-project-handler";
import {handleOpenProjectsListCommand} from "./handlers/open-projects-handler";


export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, "tex-project-manager" is now active!');
	createDatabase();

	const disposable = vscode.commands.registerCommand('tex-project-manager.createProject', handleCreateProjectCommand);
	const disposable2 = vscode.commands.registerCommand('tex-project-manager.openProjectsList', handleOpenProjectsListCommand);

	context.subscriptions.push(disposable2);

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

export function deactivate() {}