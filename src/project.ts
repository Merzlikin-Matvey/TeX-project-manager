import * as path from 'path';
import fs from "fs";
import {moveTemplate} from "./templates";
import {Database} from "./database";
import {getDefaultDatabasePath} from "./user-config";
import * as vscode from 'vscode';

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

    fs.mkdirSync(this.full_path, { recursive: true });
    moveTemplate(this.template, this.full_path, this.name);
    const database = new Database(getDefaultDatabasePath());
    database.addProject(this);

    if (fs.existsSync(this.full_tex_file_path)) {
      vscode.window.showInformationMessage(`Project ${this.name} created at ${this.full_path}`);
      await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(this.full_path), { forceNewWindow: false });
    } else {
      vscode.window.showErrorMessage(`Failed to create project ${this.name} at ${this.full_path}`);
    }
  }
}