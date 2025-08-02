import * as vscode from 'vscode';
import {	ProjectsDatabase } from './new_database';
import {handleCreateProjectCommand} from "./handlers/create-project-handler";
import {handleOpenProjectsListCommand} from "./handlers/open-projects-handler";



export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, "tex-project-manager" is now active!');
	const database = new ProjectsDatabase();

	const disposable = vscode.commands.registerCommand('tex-project-manager.createProject', handleCreateProjectCommand);
	const disposable2 = vscode.commands.registerCommand('tex-project-manager.openProjectsList', handleOpenProjectsListCommand);

	context.subscriptions.push(disposable2);

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

export function deactivate() {}