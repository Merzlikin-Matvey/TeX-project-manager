import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import {TemplateManager} from "./templates";
import {Database} from "./database";

export class Project {
  name: string;
  path: string;
  full_path: string;
  tex_file_name: string;
  full_tex_file_path: string;
  template: string;
  last_opened: Date;

  constructor(projectName: string, projectPath: string, projectTemplate: string, lastOpened?: Date) {
    this.name = projectName;
    this.path = projectPath;
    this.tex_file_name = `${projectName}.tex`;
    this.template = projectTemplate;
    this.last_opened = lastOpened || new Date();

    this.full_path = path.join(this.path, this.name);
    this.full_tex_file_path = path.join(this.full_path, this.tex_file_name);
  }

  updateLastOpened() {
    this.last_opened = new Date();
  }

  async create() {
    if (!this.name) {
      console.log('Project name is not defined');
      return;
    } else if (!this.path) {
      console.log('Project path is not defined');
      return;
    } else if (!this.template) {
      console.log('Template name is not defined');
      return;
    }

    if (fs.existsSync(this.full_path)) {
      console.log(`Project ${this.name} already exists at ${this.full_path}`);
      return;
    }
    console.log(`Creating project ${this.name} at ${this.full_path}`);
    fs.mkdirSync(this.full_path, { recursive: true });
    const templateManager = new TemplateManager();
    const database = new Database();
    templateManager.moveTemplate(this.template, this.full_path, this.name);
    database.addProject(this);

    if (fs.existsSync(this.full_tex_file_path)) {
      vscode.window.showInformationMessage(`Project ${this.name} created at ${this.full_path}`);
      await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(this.full_path), { forceNewWindow: false });
    } else {
      vscode.window.showErrorMessage(`Failed to create project ${this.name} at ${this.full_path}`);
    }
  }

  canProjectBeRenamed(newName: string) {
    const database = new Database();

    const testProjectWithENewNameExists = database.getProject(path.join(this.path, newName));
    return !testProjectWithENewNameExists;
  }


  isProjectLocked(): boolean {
    const folderPath = this.full_path;
    console.log('folder path', folderPath);
    const tempFolderPath = path.join(path.dirname(folderPath), `temp_${path.basename(folderPath)}`);
    try {
      fs.renameSync(folderPath, tempFolderPath);
      fs.renameSync(tempFolderPath, folderPath);
      return false;
    } catch (error) {
      return true;
    }
  }

  async editName(newName: string) {
    const database = new Database();

    if (!newName) {
      console.log('Project name is not defined');
      return;
    }

    if (!this.canProjectBeRenamed(newName)) {
      console.log(`Project ${newName} already exists at ${path.join(this.path, newName)}`);
      return;
    }

    if (this.isProjectLocked()) {
      console.log(`Project ${this.name} is locked`);
      return;
    }

    const oldProjectPath = this.full_path;
    const newProjectPath = path.join(this.path, newName);

    database.removeProject(this);

    console.log(oldProjectPath, newProjectPath);

    fs.renameSync(oldProjectPath, newProjectPath);
    this.name = newName;
    this.full_path = newProjectPath;

    console.log(this.name, this.full_path, this.full_tex_file_path);

    database.addProject(this);
  }

  editPath(newProjectPath: string) {
    const database = new Database();
    if (!newProjectPath) {
      console.log('Project path is not defined');
      return;
    }

    const newFullProjectPath = path.join(newProjectPath, this.name);

    if (fs.existsSync(newFullProjectPath)) {
      console.log(`Project already exists at ${newProjectPath}`);
      return;
    }

    if (this.isProjectLocked()) {
      console.log(`Project ${this.full_path} is locked`);
      return;
    }

    const oldProjectPath = this.full_path;
    const oldFullProjectPath = this.full_path;

    database.removeProject(this);

    fs.renameSync(oldFullProjectPath, newFullProjectPath);
    console.log("oldProjectPath, newProjectPath");
    console.log(oldProjectPath, newProjectPath);
    this.path = newProjectPath;
    this.full_path = path.join(this.path, this.name);
    this.full_tex_file_path = path.join(this.full_path, this.tex_file_name);

    database.addProject(this);
  }
}