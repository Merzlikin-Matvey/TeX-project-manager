import { Database } from "../database";
import * as vscode from 'vscode';

async function editProjectName(projectPath: string) {
  const database = new Database();
  const project = database.getProject(projectPath);

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
      project?.editName(projectName);
      vscode.window.showInformationMessage(`Project name changed to ${projectName}`);
    }

  }
}


async function editProject(projectPath: string) {
  const database = new Database();
  const project = database.getProject(projectPath);

  const projectItems = [
    { label: 'Name', value: project?.name },
    { label: 'Full Path', value: project?.full_path },
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
  });

  quickPick.show();

}

export async function handleOpenProjectsListCommand() {
  const database = new Database();
  const projects = database.getProjects();
  const projectItems = Object.keys(projects).map(key => ({
    label: projects[key].name,
    description: projects[key].full_path,
    lastOpened: new Date(projects[key].last_opened),
    buttons: [{ iconPath: new vscode.ThemeIcon('edit'), tooltip: 'Edit Project' }]
  }));

  projectItems.sort((a, b) => b.lastOpened.getTime() - a.lastOpened.getTime());

  const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem & { buttons: vscode.QuickInputButton[] }>();
  quickPick.items = projectItems;
  quickPick.placeholder = 'Select a project to open';
  quickPick.ignoreFocusOut = true;

  quickPick.onDidTriggerItemButton(async (e) => {
    if (e.item.description) {
      const project = database.getProject(e.item.description);
      if (project) {
        quickPick.hide();
        await editProject(project.full_path);
      }
    }
  });

  quickPick.onDidAccept(async () => {
    const selectedProject = quickPick.selectedItems[0];
    if (selectedProject && selectedProject.description) {
      const project = database.getProject(selectedProject.description);
      if (project) {
        project.updateLastOpened();
        database.updateProject(project);
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(project.full_path), { forceNewWindow: false });
      } else {
        vscode.window.showErrorMessage(`Project at ${selectedProject.description} not found in the database`);
      }
    }
    quickPick.hide();
  });

  quickPick.show();
}