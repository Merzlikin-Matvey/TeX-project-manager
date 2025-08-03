import { Database } from "../database";
import * as vscode from 'vscode';
import * as fs from "node:fs";
import {	ProjectsDatabase } from '../new_database';

async function editProjectName(projectPath: string) {
  const database = new ProjectsDatabase();
  const project = await database.getProject(projectPath);

  const projectName = await vscode.window.showInputBox({
    value: project?.name,
    placeHolder: 'Project Name',
    prompt: 'Enter the project name (soon)',
    ignoreFocusOut: true
  });

  if (projectName) {
    if (project?.isProjectLocked()) {
      vscode.window.showErrorMessage(`Project ${projectName} is now locked`);
    }
    else if (!project?.canProjectBeRenamed(projectName)) {
      vscode.window.showErrorMessage(`Project ${projectName} already exists at ${project?.full_path}`);
    }
    else{
      await project?.editName(projectName);
      vscode.window.showInformationMessage(`Project name changed to ${projectName}`);
    }

  }
}

async function editProjectPath(projectPath: string) {
  const database = new ProjectsDatabase();
  const project = await database.getProject(projectPath);

  const newProjectUri = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: 'Select new project path'
  });

  if (newProjectUri && newProjectUri[0]) {
    const newProjectPath = newProjectUri[0].fsPath;

    if (project?.isProjectLocked()) {
      vscode.window.showErrorMessage(`Project ${project.full_path} is now locked`);
    }
    else {
      project?.editPath(newProjectPath);
      vscode.window.showInformationMessage(`Project path changed to ${newProjectPath}`);
    }
  }
}

async function editProject(projectPath: string) {
  const database = new ProjectsDatabase();
  const project = await database.getProject(projectPath);

  const projectItems = [
    { label: 'Name', value: project?.name },
    { label: 'Path', value: project?.path },
  ];

  const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem>();
  quickPick.items = projectItems.map(item => ({ label: item.label, description: item.value }));
  quickPick.placeholder = 'Edit project';
  quickPick.ignoreFocusOut = true;

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems[0];
    if (selected && selected.label === 'Name') {
      quickPick.hide();
      editProjectName(projectPath);
    }
    else if (selected && selected.label === 'Path') {
      quickPick.hide();
      editProjectPath(projectPath);
    }
  });

  quickPick.show();

}

export async function handleOpenProjectsListCommand() {
  console.log('Opening projects list');
  const database = new ProjectsDatabase();
  console.log('Opening projects list 2');
  const projects = await database.getProjects();
  console.log('Projects retrieved:', projects);
  const projectItems = Object.keys(projects).map(key => ({
    label: projects[key].name,
    description: projects[key].full_path,
    lastOpened: new Date(projects[key].last_opened),
    buttons: [{ iconPath: new vscode.ThemeIcon('edit'), tooltip: 'Edit Project' }]
  }));
  console.log('Project items created:', projectItems);

  projectItems.sort((a, b) => b.lastOpened.getTime() - a.lastOpened.getTime());
  console.log(projectItems);
  const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem & { buttons: vscode.QuickInputButton[] }>();
  quickPick.items = projectItems;
  quickPick.placeholder = 'Select a project to open';
  quickPick.ignoreFocusOut = true;

  quickPick.onDidTriggerItemButton(async (e) => {
    if (e.item.description) {
      const project = await database.getProject(e.item.description);
      if (project) {
        quickPick.hide();
        await editProject(project.full_path);
      }
    }
  });

  quickPick.onDidAccept(async () => {
    const selectedProject = quickPick.selectedItems[0];
    if (selectedProject && selectedProject.description) {
      const project = await database.getProject(selectedProject.description);
      if (project) {
        project.updateLastOpened();
          await database.updateProject(project);
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(project.full_path), { forceNewWindow: false });
      } else {
        vscode.window.showErrorMessage(`Project at ${selectedProject.description} not found in the database`);
      }
    }
    quickPick.hide();
  });

  quickPick.show();
}