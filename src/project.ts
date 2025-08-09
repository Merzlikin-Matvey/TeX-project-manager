import * as path from 'path';
import { join } from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import {TemplateManager} from "./templates";
import {	Database } from './database';

export class Project {
  name: string; // Name of the project and its folder
  path: string; // Path to the project folder (not including projects name)
  full_path: string; // Full path to the project folder (including projects name)
  tex_file_name: string; // Name of the main TeX file (e.g., project_name.tex)
  full_tex_file_path: string; // Full path to the main TeX file (e.g., /path/to/project/project_name.tex)
  template: string; // Template name used for the project
  last_opened: Date; // Date when the project was last opened

  constructor(
      name: string,
      path: string,
      template: string,
      lastOpened?: Date,
      full_path?: string,
      full_tex_file_path?: string
  ) {
    this.name = name;
    this.path = path;
    this.template = template;
    this.last_opened = lastOpened || new Date();
    this.tex_file_name = `${name}.tex`;
    this.full_path = full_path || join(this.path, this.name);
    this.full_tex_file_path = full_tex_file_path || join(this.full_path, this.tex_file_name);
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
    await database.addProject(this);

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

    await database.removeProject(this);

    console.log(oldProjectPath, newProjectPath);

    fs.renameSync(oldProjectPath, newProjectPath);
    this.name = newName;
    this.full_path = newProjectPath;

    console.log(this.name, this.full_path, this.full_tex_file_path);

    await database.addProject(this);
  }

  async editPath(newProjectPath: string) {
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

    await database.removeProject(this);

    fs.renameSync(oldFullProjectPath, newFullProjectPath);
    console.log("oldProjectPath, newProjectPath");
    console.log(oldProjectPath, newProjectPath);
    this.path = newProjectPath;
    this.full_path = path.join(this.path, this.name);
    this.full_tex_file_path = path.join(this.full_path, this.tex_file_name);

    await database.addProject(this);
  }
}