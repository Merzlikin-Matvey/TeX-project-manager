import * as fs from 'fs';
import * as path from 'path';
import * as vscode from "vscode";
import { moveTemplate } from "./templates";
import { Project } from "./project";
import { addProject } from "./database";

export async function createProject(project: Project) {
    if (!project.name) {
        console.log('Project name is not defined');
        return;
    } else if (!project.path) {
        console.log('Project path is not defined');
        return;
    } else if (!project.template) {
        console.log('Template name is not defined');
        return;
    }


    project = new Project(project.name, project.path, project.template);


    if (fs.existsSync(project.full_path)) {
        console.log(`Project ${project.name} already exists at ${project.full_path}`);
        return;
    }

    fs.mkdirSync(project.full_path, { recursive: true });
    moveTemplate(project.template, project.full_path, project.name);
    addProject(project);


    if (fs.existsSync(project.full_tex_file_path)) {
        vscode.window.showInformationMessage(`Project ${project.name} created at ${project.full_path}`);
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(project.full_path), { forceNewWindow: false });

    } else {
        vscode.window.showErrorMessage(`Failed to create project ${project.name} at ${project.full_path}`);
    }

}