import vscode from "vscode";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { Database } from "../database";
import { Project } from "../project";
import { addDefaultTemplate, createTemplateFolder, getTemplateNames, getTemplatesPath } from "../templates";
import { getDefaultDatabasePath, getDefaultFolderPath, getDefaultTemplate } from "../user-config";

export async function handleCreateProjectCommand() {
  const defaultFolderPath = getDefaultFolderPath().replace('~', os.homedir());
  const defaultTemplate = getDefaultTemplate();

  ensureFolderExists(defaultFolderPath);
  ensureTemplatesExist();

  let folderUri: vscode.Uri | undefined = vscode.Uri.file(defaultFolderPath);
  let projectName: string | undefined;
  let templateName: string | undefined = defaultTemplate;

  addDefaultTemplate();

  while (true) {
    const selected = await showQuickPickOptions(projectName, folderUri, templateName, defaultFolderPath);

    if (selected?.label === '$(debug-start) Create project') {
      await createProject(projectName, folderUri, templateName);
    } else if (selected?.label === '$(file-directory) Select Folder') {
      folderUri = await selectFolder(folderUri, defaultFolderPath);
    } else if (selected?.label === '$(pencil) Enter Project Name') {
      projectName = await enterProjectName();
    } else if (selected?.label === '$(file-code) Select Template') {
      templateName = await selectTemplate();
    } else {
      break;
    }
  }
}

function ensureFolderExists(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    vscode.window.showInformationMessage(`Created projects folder: ${folderPath}`);
  }
}

function ensureTemplatesExist() {
  const templatesPath = getTemplatesPath();
  if (!fs.existsSync(templatesPath)) {
    createTemplateFolder();
    addDefaultTemplate();
  }
}

async function showQuickPickOptions(projectName: string | undefined, folderUri: vscode.Uri | undefined, templateName: string | undefined, defaultFolderPath: string) {
  const options = [
    { label: '$(pencil) Enter Project Name', description: `Project name: ${projectName || 'Type the name of the new project'}` },
    { label: '$(file-directory) Select Folder', description: `Selected folder: ${folderUri?.fsPath || defaultFolderPath}` },
    { label: '$(file-code) Select Template', description: `Selected template: ${templateName}` },
    { label: '$(debug-start) Create project' }
  ];
  return vscode.window.showQuickPick(options, {placeHolder: 'Select an option', ignoreFocusOut: true});
}

async function createProject(projectName: string | undefined, folderUri: vscode.Uri | undefined, templateName: string | undefined) {
  if (projectName && folderUri && templateName) {
    const fullProjectPath = path.join(folderUri.fsPath, projectName);

    if (fs.existsSync(fullProjectPath)) {
      await handleExistingProject(fullProjectPath, projectName);
    } else {
      const project = new Project(projectName, fullProjectPath, templateName);
      await project.create();
    }
  }
}

async function handleExistingProject(fullProjectPath: string, projectName: string) {
  vscode.window.showErrorMessage(`Project ${projectName} already exists at ${fullProjectPath}`);
  const selected = await vscode.window.showQuickPick(
      [
        { label: 'Open existing project' },
        { label: 'Change project parameters' }
      ],
      { placeHolder: `Project ${projectName} already exists. Select an option`, ignoreFocusOut: true }
  );

  if (selected?.label === 'Open existing project') {
    await openExistingProject(fullProjectPath);
  }
}

async function openExistingProject(fullProjectPath: string) {
  const database = new Database(getDefaultDatabasePath());
  const project = database.getProject(fullProjectPath);
  if (project) {
    project.updateLastOpened();
    database.updateProject(project);
    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(fullProjectPath), { forceNewWindow: false });
  } else {
    vscode.window.showErrorMessage(`Project at ${fullProjectPath} not found in the database`);
  }
}

async function selectFolder(folderUri: vscode.Uri | undefined, defaultFolderPath: string) {
  const selectedFolderUri = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: 'Select Folder'
  });

  if (selectedFolderUri && selectedFolderUri[0]) {
    folderUri = selectedFolderUri[0];
    vscode.window.showInformationMessage(`Selected folder: ${folderUri.fsPath}`);
  } else {
    vscode.window.showErrorMessage('No folder selected');
  }
  return folderUri;
}

async function enterProjectName() {
  const newProjectName = await vscode.window.showInputBox({
    prompt: 'Enter the name of the project',
    placeHolder: 'Project Name',
    ignoreFocusOut: true
  });

  if (newProjectName) {
    vscode.window.showInformationMessage(`Project name: ${newProjectName}`);
    return newProjectName;
  } else {
    vscode.window.showErrorMessage('No project name provided');
    return undefined;
  }
}

async function selectTemplate() {
  const templatePath = getTemplatesPath();
  if (!fs.existsSync(templatePath)) {
    createTemplateFolder();
  }

  const templates = getTemplateNames();
  templates.push({ label: '$(add) Add Template' });
  const selectedTemplate = await vscode.window.showQuickPick(templates, {
    placeHolder: 'Select a template',
    ignoreFocusOut: true
  });

  if (selectedTemplate?.label === '$(add) Add Template') {
    vscode.window.showInformationMessage(`Opening folder with templates: ${templatePath}`);
    exec(`explorer ${templatePath.replace(/\//g, '\\')}`);
  } else if (selectedTemplate) {
    vscode.window.showInformationMessage(`Selected template: ${selectedTemplate.label}`);
    return selectedTemplate.label;
  } else {
    vscode.window.showErrorMessage('No template selected');
    return undefined;
  }
}