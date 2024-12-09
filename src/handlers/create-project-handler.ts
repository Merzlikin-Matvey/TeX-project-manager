import vscode from "vscode";
import fs from "fs";
import {addDefaultTemplate, createTemplateFolder, getTemplateNames, getTemplatesPath} from "../templates";
import path from "path";
import {getProject, updateProject} from "../database";
import {createProject} from "../create-project";
import {Project} from "../project";
import {exec} from "child_process";
import {getDefaultFolderPath, getDefaultTemplate} from "../user-config";

export async function handleCreateProjectCommand() {
  let defaultFolderPath = getDefaultFolderPath();
  let defaultTemplate = getDefaultTemplate();

  if (!fs.existsSync(defaultFolderPath)) {
    fs.mkdirSync(defaultFolderPath, { recursive: true });
    vscode.window.showInformationMessage(`Created projects folder: ${defaultFolderPath}`);
  }

  const templatesPath = getTemplatesPath();
  if (!fs.existsSync(templatesPath)) {
    createTemplateFolder();
    addDefaultTemplate();
  }

  let folderUri: vscode.Uri | undefined = vscode.Uri.file(defaultFolderPath);
  let projectName: string | undefined;
  let templateName: string | undefined = defaultTemplate;

  addDefaultTemplate();


  const namePick = { label: '$(pencil) Enter Project Name', description: 'Type the name of the new project' };
  const folderPick = { label: '$(file-directory) Select Folder', description: `Default folder: ${defaultFolderPath}` };
  const templatePick = { label: '$(file-code) Select Template', description: `Default template: ${templateName}` };
  const createProjectPick = { label: '$(debug-start) Create project' };

  const openExistingProjectPick = { label: 'Open existing project' };
  const changeProjectParametersPick = { label: 'Change project parameters' };

  const addTemplatePick = { label: '$(add) Add Template' };


  while (true) {
    let selected;
    let actualOptions;
    if (projectName) {
      actualOptions = [createProjectPick, namePick, templatePick, folderPick];
    } else {
      actualOptions = [namePick, templatePick, folderPick];
    }
    selected = await vscode.window.showQuickPick(actualOptions, {
      placeHolder: 'Select an option',
      ignoreFocusOut: true
    });

    if (selected === createProjectPick) {
      if (projectName && folderUri && templateName) {
        const fullProjectPath = path.join(folderUri.fsPath, projectName);

        if (fs.existsSync(fullProjectPath)) {
          console.log("exists");
          vscode.window.showErrorMessage(`Project ${projectName} already exists at ${fullProjectPath}`);
          selected = await vscode.window.showQuickPick([openExistingProjectPick, changeProjectParametersPick], {
            placeHolder: `Project ${projectName} already exists. Select an option`,
            ignoreFocusOut: true
          });

          while (true) {
            if (selected === openExistingProjectPick) {
              if (projectName && fullProjectPath) {
                vscode.window.showInformationMessage(`Opening project ${projectName} at ${fullProjectPath}`);
              } else {
                vscode.window.showErrorMessage('No project name or path provided');
                console.error('No project name or path provided');
              }
              const project = getProject(fullProjectPath);
              if (project) {
                project.updateLastOpened();
                updateProject(project);
              } else {
                vscode.window.showErrorMessage(`Project at ${fullProjectPath} not found in the database`);
              }
              await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(fullProjectPath), {forceNewWindow: false});
              break;
            } else if (selected === changeProjectParametersPick) {
              projectName = undefined;
              folderUri = vscode.Uri.file(defaultFolderPath);

              namePick.description = `Type the name of the new project: ${projectName}`;
              folderPick.description = `Default folder: ${defaultFolderPath}`;
            } else {
              break;
            }
          }

        } else {
          await createProject(new Project(projectName, folderUri.fsPath, templateName));
        }
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
    } else if (selected === templatePick) {
      let templatePath = getTemplatesPath();

      if (!fs.existsSync(templatePath)) {
        createTemplateFolder();
      }

      let templates = getTemplateNames();
      templates.push(addTemplatePick);
      const selectedTemplate = await vscode.window.showQuickPick(templates, {
        placeHolder: 'Select a template',
        ignoreFocusOut: true
      });

      if (selectedTemplate === addTemplatePick) {
        vscode.window.showInformationMessage(`Opening folder with templates: ${templatePath}`);
        exec(`explorer ${templatePath.replace(/\//g, '\\')}`);
      } else if (selectedTemplate) {
        templateName = selectedTemplate.label;
        templatePick.description = `Selected template: ${templateName}`;
        vscode.window.showInformationMessage(`Selected template: ${templateName}`);
      } else {
        vscode.window.showErrorMessage('No template selected');
        console.error('No template selected');
      }
    } else {
      break;
    }
  }
}