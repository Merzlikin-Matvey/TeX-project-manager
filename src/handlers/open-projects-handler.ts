import {getProject, getProjects, updateProject} from "../database";
import vscode from "vscode";

export async function handleOpenProjectsListCommand() {
  const projects = getProjects();
  const projectItems = Object.keys(projects).map(key => ({
    label: projects[key].name,
    description: projects[key].full_path,
    lastOpened: new Date(projects[key].last_opened)
  }));

  projectItems.sort((a, b) => b.lastOpened.getTime() - a.lastOpened.getTime());


  projectItems.forEach(projectItem => {
    const project = getProject(projectItem.description);
    if (project) {
      console.log(project.last_opened);
    }
  });

  const selectedProject = await vscode.window.showQuickPick(projectItems, {
    placeHolder: 'Select a project to open',
    ignoreFocusOut: true
  });

  if (selectedProject) {
    const project = getProject(selectedProject.description);
    if (project) {
      project.updateLastOpened();
      updateProject(project);
      await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(project.full_path), { forceNewWindow: false });
    } else {
      vscode.window.showErrorMessage(`Project at ${selectedProject.description} not found in the database`);
    }
  }
}